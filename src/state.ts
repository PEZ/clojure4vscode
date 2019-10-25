import * as vscode from 'vscode';
import * as Immutable from 'immutable';
import * as ImmutableCursor from 'immutable-cursor';
import Analytics from './analytics';
import { ReplConnectSequence } from './nrepl/connectSequence';
import * as util from './utilities';
import * as path from 'path';
import * as fs from 'fs';
import { customREPLCommandSnippet } from './repl-window';

let extensionContext: vscode.ExtensionContext;
export function setExtensionContext(context: vscode.ExtensionContext) {
    extensionContext = context;
    if (context.workspaceState.get('selectedCljTypeName') == undefined) {
        context.workspaceState.update('selectedCljTypeName', "unknown");
    }
}

// include the 'file' and 'untitled' to the 
// document selector. All other schemes are 
// not known and therefore not supported.
const documentSelector = [
    { scheme: 'file', language: 'clojure' },
    { scheme: 'untitled', language: 'clojure' }
];

var data;
const initialData = {
    hostname: null,
    port: null,
    clj: null,
    cljs: null,
    cljsBuild: null,
    terminal: null,
    connected: false,
    connecting: false,
    outputChannel: vscode.window.createOutputChannel("Calva says"),
    connectionLogChannel: vscode.window.createOutputChannel("Calva Connection Log"),
    diagnosticCollection: vscode.languages.createDiagnosticCollection('calva: Evaluation errors'),
    compilationDiagnosticCollection: vscode.languages.createDiagnosticCollection('Calva: Compilation errors'),
    analytics: null
};

reset();

const cursor = ImmutableCursor.from(data, [], (nextState) => {
    data = Immutable.fromJS(nextState);
});

function deref() {
    return data;
}

// Super-quick fix for: https://github.com/BetterThanTomorrow/calva/issues/144
// TODO: Revisit the whole state management business.
function _outputChannel(name: string): vscode.OutputChannel {
    const channel = deref().get(name);
    if (channel.toJS !== undefined) {
        return channel.toJS();
    } else {
        return channel;
    }
}

function outputChannel(): vscode.OutputChannel {
    return _outputChannel('outputChannel');
}

function connectionLogChannel(): vscode.OutputChannel {
    return _outputChannel('connectionLogChannel');
}

function analytics(): Analytics {
    const analytics = deref().get('analytics');
    if (analytics.toJS !== undefined) {
        return analytics.toJS();
    } else {
        return analytics;
    }
}


function reset() {
    data = Immutable.fromJS(initialData);
}

/**
 * Trims EDN alias and profile names from any surrounding whitespace or `:` characters.
 * This in order to free the user from having to figure out how the name should be entered.
 * @param  {string} name 
 * @return {string} The trimmed name
 */
function _trimAliasName(name: string): string {
    return name.replace(/^[\s,:]*/, "").replace(/[\s,:]*$/, "")
}

// TODO find a way to validate the configs
function config() {
    let configOptions = vscode.workspace.getConfiguration('calva');
    return {
        format: configOptions.get("formatOnSave"),
        evaluate: configOptions.get("evalOnSave"),
        lint: configOptions.get("lintOnSave"),
        test: configOptions.get("testOnSave"),
        jokerPath: configOptions.get("jokerPath"),
        useWSL: configOptions.get("useWSL"),
        syncReplNamespaceToCurrentFile: configOptions.get("syncReplNamespaceToCurrentFile"),
        jackInEnv: configOptions.get("jackInEnv"),
        openBrowserWhenFigwheelStarted: configOptions.get("openBrowserWhenFigwheelStarted") as boolean,
        customCljsRepl: configOptions.get("customCljsRepl", null),
        replConnectSequences: configOptions.get("replConnectSequences") as ReplConnectSequence[],
        myLeinProfiles: configOptions.get("myLeinProfiles", []).map(_trimAliasName) as string[],
        myCljAliases: configOptions.get("myCljAliases", []).map(_trimAliasName) as string[],
        pprint: configOptions.get("prettyPrint") as boolean,
        asyncOutputDestination: configOptions.get("sendAsyncOutputTo") as string,
        customREPLCommandSnippets: configOptions.get("customREPLCommandSnippets", []) as customREPLCommandSnippet[]
    };
}

const PROJECT_DIR_KEY = "connect.projectDir";

export function getProjectRoot(useCache = true): string {
    if (useCache) {
        return deref().get(PROJECT_DIR_KEY);
    }
}

export function getProjectWsFolder(): vscode.WorkspaceFolder {
    const doc = util.getDocument({});
    return doc ? vscode.workspace.getWorkspaceFolder(doc.uri) : null;
}

/**
 * Figures out, and stores, the current clojure project root
 * Also stores the WorkSpace folder for the project to be used
 * when executing the Task and get proper vscode reporting.
 * 
 * 1. If there is no file open in single-rooted workspaced use 
 *    the workspace folder as a starting point. In multi-rooted
 *    workspaces stop and complain.
 * 2. If there is a file open, use it to determine the project root
 *    by looking for project files from the file's directory and up to
 *    the window root (for plain folder windows) or the file's
 *    workspace folder root (for workspaces) to find the project root.
 *
 * If there is no project file found, throw an exception.
 */
export async function initProjectDir(): Promise<void> {
    const projectFileNames: string[] = ["project.clj", "shadow-cljs.edn", "deps.edn"],
          workspace = vscode.workspace.workspaceFolders![0],
          doc = util.getDocument({});
          
    // first try the workplace folder 
    let workspaceFolder = doc ? vscode.workspace.getWorkspaceFolder(doc.uri) : null;
    if (!workspaceFolder) {
        if(vscode.workspace.workspaceFolders.length == 1) {
           // this is only save in a one directory workspace 
           // (aks "Open Folder") environment. 
           workspaceFolder = workspace ? vscode.workspace.getWorkspaceFolder(workspace.uri) : null;
        }
    }
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("There is no document opened in the workspace. Please open a file in your Clojure project and try again. Aborting.");
        analytics().logEvent("REPL", "JackinOrConnectInterrupted", "NoCurrentDocument").send();
        throw "There is no document opened in the workspace. Aborting.";
    } else {
        let rootPath: string = path.resolve(workspaceFolder.uri.fsPath);
        let d = null;
        let prev = null;
        if(doc) {
            d = path.dirname(doc.uri.fsPath);
        } else {
            d = workspaceFolder.uri.fsPath;
        }
        while (d != prev) {
            for (let projectFile in projectFileNames) {
                const p = path.resolve(d, projectFileNames[projectFile]);
                if (fs.existsSync(p)) {
                    rootPath = d;
                    break;
                }
            }
            if (d == rootPath) {
                break;
            }
            prev = d;
            d = path.resolve(d, "..");
        }

        // at least be sure the the root folder contains a 
        // supported project. 
        for (let projectFile in projectFileNames) {
            const p = path.resolve(rootPath, projectFileNames[projectFile]);
            if (fs.existsSync(p)) {
                cursor.set(PROJECT_DIR_KEY, rootPath);
                return; 
            }
        }
        vscode.window.showErrorMessage("There was no valid project configuration found in the workspace. Please open a file in your Clojure project and try again. Aborting.");
        analytics().logEvent("REPL", "JackinOrConnectInterrupted", "NoCurrentDocument").send();
        throw "There was no valid project configuration found in the workspace. Aborting.";
    }
}

export {
    cursor,
    documentSelector,
    deref,
    reset,
    config,
    extensionContext,
    outputChannel,
    connectionLogChannel,
    analytics
};
