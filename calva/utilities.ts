import * as vscode from 'vscode';
const specialWords = ['-', '+', '/', '*']; //TODO: Add more here
import * as _ from 'lodash';
import * as state from './state';
import * as fs from 'fs';
const syntaxQuoteSymbol = "`";


function getProjectDir() {
    let path = vscode.workspace.rootPath + "/" + state.config().projectRootDirectory;

    if (fs.existsSync(path)) {
        return path;
    } else {
        return vscode.workspace.rootPath;
    }
}

function getCljsReplStartCode() {
    return vscode.workspace.getConfiguration('calva').startCLJSREPLCommand;
}

function getShadowCljsReplStartCode(build) {
    return '(shadow.cljs.devtools.api/nrepl-select ' + build + ')';
}

function getNamespace(text) {
    let match = text.match(/^[\s\t]*\((?:[\s\t\n]*(?:in-){0,1}ns)[\s\t\n]+'?([\w.\-\/]+)[\s\S]*\)[\s\S]*/);
    return match ? match[1] : 'user';
}

function getStartExpression(text) {
    let match = text.match(/^\(([^\)]+)[\)]+/g);
    return match ? match[0] : "(ns user)";
}

function getActualWord(document, position, selected, word) {
    if (selected === undefined) {
        let selectedChar = document.lineAt(position.line).text.slice(position.character, position.character + 1),
            isFn = document.lineAt(position.line).text.slice(position.character - 1, position.character) === "(";
        if (selectedChar !== undefined &&
            specialWords.indexOf(selectedChar) !== -1 &&
            isFn) {
            return selectedChar;
        } else {
            return "";
        }
    } else {
        return (word && word.startsWith(syntaxQuoteSymbol)) ? word.substr(1) : word;
    }
}

function getWordAtPosition(document, position) {
    let selected = document.getWordRangeAtPosition(position), selectedText = selected !== undefined ? document.getText(new vscode.Range(selected.start, selected.end)) : "", text = getActualWord(document, position, selected, selectedText);
    return text;
}

function getDocument(document) {
    if (document && document.hasOwnProperty('fileName')) {
        return document;
    } else if (vscode.window.activeTextEditor) {
        return vscode.window.activeTextEditor.document;
    } else if (vscode.window.visibleTextEditors.length > 0) {
        return vscode.window.visibleTextEditors[0].document;
    } else {
        return null;
    }
}

function getFileType(document) {
    let doc = getDocument(document);

    if (doc && doc.fileName) {
        return doc.fileName.substr((doc.fileName.lastIndexOf('.') + 1), doc.fileName.length);
    }
    else {
        return 'clj';
    }
}

function getFileName(document) {
    let fileNameIndex = (document.fileName.lastIndexOf('\\') + 1);
    return document.fileName.substr(fileNameIndex, document.fileName.length)
}

function getDocumentNamespace(document = {}) {
    let doc = getDocument(document);

    return getNamespace(doc.getText());
}

function getSession(fileType = undefined) {
    let doc = getDocument({}),
        current = state.deref();

    if (fileType === undefined) {
        fileType = getFileType(doc);
    }
    if (fileType.match(/^clj[sc]?/)) {
        return current.get(fileType);
    } else {
        return current.get('clj');
    }
}

// ERROR HELPERS
const ERROR_TYPE = {
    WARNING: "warning",
    ERROR: "error"
};

function logSuccess(results) {
    let chan = state.deref().get('outputChannel');
    chan.appendLine("Evaluation completed successfully");
    _.each(results, (r) => {
        let value = r.hasOwnProperty("value") ? r.value : null;
        let out = r.hasOwnProperty("out") ? r.out : null;
        if (value !== null) {
            chan.appendLine("=>\n" + value);
        }
        if (out !== null) {
            chan.appendLine("out:\n" + out);
        }
    });
}

function logError(error) {
    let chan = state.deref().get('outputChannel');

    chan.appendLine(error.reason);
    if (error.line !== undefined && error.line !== null &&
        error.column !== undefined && error.column !== null) {
        chan.appendLine("at line: " + error.line + " and column: " + error.column)
    }
}

function markError(error) {
    if (error.line === null) {
        error.line = 0;
    }
    if (error.column === null) {
        error.column = 0;
    }

    let diagnostic = state.deref().get('diagnosticCollection'),
        editor = vscode.window.activeTextEditor;

    //editor.selection = new vscode.Selection(position, position);
    let line = error.line - 1,
        column = error.column,
        lineLength = editor.document.lineAt(line).text.length,
        lineText = editor.document.lineAt(line).text.substring(column, lineLength),
        firstWordStart = column + lineText.indexOf(" "),
        existing = diagnostic.get(editor.document.uri),
        err = new vscode.Diagnostic(new vscode.Range(line, column, line, firstWordStart),
            error.reason,
            vscode.DiagnosticSeverity.Error);

    let errors = (existing !== undefined && existing.length > 0) ? [...existing, err] :
        [err];
    diagnostic.set(editor.document.uri, errors);
}

function logWarning(warning) {
    let chan = state.deref().get('outputChannel');
    chan.appendLine(warning.reason);
    if (warning.line !== null) {
        if (warning.column !== null) {
            chan.appendLine("at line: " + warning.line + " and column: " + warning.column)
        } else {
            chan.appendLine("at line: " + warning.line)
        }
    }
}

function markWarning(warning) {
    if (warning.line === null) {
        warning.line = 0;
    }
    if (warning.column === null) {
        warning.column = 0;
    }

    let diagnostic = state.deref().get('diagnosticCollection'),
        editor = vscode.window.activeTextEditor;

    //editor.selection = new vscode.Selection(position, position);
    let line = Math.max(0, (warning.line - 1)),
        column = warning.column,
        lineLength = editor.document.lineAt(line).text.length,
        existing = diagnostic.get(editor.document.uri),
        warn = new vscode.Diagnostic(new vscode.Range(line, column, line, lineLength),
            warning.reason,
            vscode.DiagnosticSeverity.Warning);

    let warnings = (existing !== undefined && existing.length > 0) ? [...existing, warn] :
        [warn];
    diagnostic.set(editor.document.uri, warnings);
}


function updateREPLSessionType() {
    let current = state.deref(),
        doc = getDocument({}),
        fileType = getFileType(doc);

    if (current.get('connected')) {
        if (fileType == 'cljs' && getSession('cljs') !== null) {
            state.cursor.set('current-session-type', 'cljs');
        } else if (fileType == 'clj' && getSession('clj') !== null) {
            state.cursor.set('current-session-type', 'clj');
        } else if (fileType == 'cljc' && getSession('cljc') !== null) {
            state.cursor.set('current-session-type', getSession('cljc') == getSession('clj') ? 'clj' : 'cljs');
        } else {
            state.cursor.set('current-session-type', 'clj');
        }
    } else {
        state.cursor.set('current-session-type', null);
    }
}

function getREPLSessionType() {
    let current = state.deref();
    return current.get('current-session-type');
}

export {
    getProjectDir,
    getNamespace,
    getStartExpression,
    getWordAtPosition,
    getDocument,
    getDocumentNamespace,
    getFileType,
    getFileName,
    getSession,
    specialWords,
    ERROR_TYPE,
    logError,
    markError,
    logWarning,
    markWarning,
    logSuccess,
    updateREPLSessionType,
    getREPLSessionType,
    getCljsReplStartCode,
    getShadowCljsReplStartCode
};
