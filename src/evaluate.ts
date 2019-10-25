import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as state from './state';
import annotations from './providers/annotations';
import * as path from 'path';
import select from './select';
import * as util from './utilities';
import { activeReplWindow } from './repl-window';
import { NReplSession } from './nrepl';
import statusbar from './statusbar'
import { stripClass } from './utilities';

function addAsComment(c: number, result: string, codeSelection: vscode.Selection, editor: vscode.TextEditor, selection: vscode.Selection) {
    const indent = `${' '.repeat(c)}`, output = result.replace(/\n\r?$/, "").split(/\n\r?/).join(`\n${indent};;    `), edit = vscode.TextEdit.insert(codeSelection.end, `\n${indent};; => ${output}\n`), wsEdit = new vscode.WorkspaceEdit();
    wsEdit.set(editor.document.uri, [edit]);
    vscode.workspace.applyEdit(wsEdit).then((_v) => {
        editor.selection = selection;
    });
}

async function evaluateSelection(document = {}, options = {}) {
    let current = state.deref(),
        chan = state.outputChannel(),
        doc = util.getDocument(document),
        pprint = options["pprint"] || false,
        replace = options["replace"] || false,
        topLevel = options["topLevel"] || false,
        asComment = options["comment"] || false;
    if (current.get('connected')) {
        let client = util.getSession(util.getFileType(doc));
        let editor = vscode.window.activeTextEditor,
            selection = editor.selection,
            codeSelection: vscode.Selection = null,
            code = "";

        if (selection.isEmpty) {
            state.analytics().logEvent("Evaluation", topLevel ? "TopLevel" : "CurrentForm").send();
            codeSelection = select.getFormSelection(doc, selection.active, topLevel);
            code = doc.getText(codeSelection);
        } else {
            state.analytics().logEvent("Evaluation", "Selection").send();
            codeSelection = selection;
            code = doc.getText(selection);
        }

        if (code.length > 0) {
            annotations.decorateSelection("", codeSelection, editor, annotations.AnnotationStatus.PENDING);
            let c = codeSelection.start.character

            let err: string[] = [], out: string[] = [];

            let res = await client.eval("(in-ns '" + util.getNamespace(doc) + ")").value;

            try {
                const line = codeSelection.start.line,
                    column = codeSelection.start.character,
                    filePath = doc.fileName,
                    context = client.eval(code, {
                        file: filePath,
                        line: line + 1,
                        column: column + 1,
                        stdout: m => out.push(m),
                        stderr: m => err.push(m),
                        pprint: !!pprint
                    });
                let value = await context.value;
                value = util.stripAnsi(context.pprintOut || value);

                if (replace) {
                    const indent = `${' '.repeat(c)}`,
                        edit = vscode.TextEdit.replace(codeSelection, value.replace(/\n/gm, "\n" + indent)),
                        wsEdit = new vscode.WorkspaceEdit();
                    wsEdit.set(editor.document.uri, [edit]);
                    vscode.workspace.applyEdit(wsEdit);
                } else if (asComment) {
                    addAsComment(c, value, codeSelection, editor, selection);
                } else {
                    annotations.decorateSelection(value, codeSelection, editor, annotations.AnnotationStatus.SUCCESS);
                    annotations.decorateResults(value, false, codeSelection, editor);
                }

                if (out.length > 0) {
                    chan.appendLine("stdout:");
                    chan.appendLine(normalizeNewLines(out));
                }
                if (!asComment) {
                    chan.appendLine('=>');
                    chan.appendLine(value);
                }

                if (err.length > 0) {
                    chan.appendLine("Error:")
                    chan.appendLine(normalizeNewLines(err));
                }
            } catch (e) {
                if (!err.length) { // venantius/ultra outputs errors on stdout, it seems.
                    err = out;
                }
                if (err.length > 0) {
                    chan.appendLine("Error:")
                    chan.appendLine(normalizeNewLines(err));
                }

                const message = util.stripAnsi(err.join("\n"));
                const exceptionClassName = stripClass(e);

                if (exceptionClassName === "clojure.lang.Compiler$CompilerException") {
                    const range = getCompilationErrorRange(err[0]);
                    annotations.markCompilationError(range, message, editor.document.uri);
                } else {
                    annotations.decorateSelection(message, codeSelection, editor, annotations.AnnotationStatus.ERROR);
                }

                annotations.decorateResults(message, true, codeSelection, editor);
                if (asComment) {
                    addAsComment(c, message, codeSelection, editor, selection);
                }
            }
        }
    } else
        vscode.window.showErrorMessage("Not connected to a REPL")

    function getCompilationErrorRange(errorMessage: string): vscode.Range {
        const errorLocation = errorMessage.match(/\d+:\d+/);
        const lineAndColumn = errorLocation[0].split(":");
        const line = parseInt(lineAndColumn[0], 10) - 1;
        const column = parseInt(lineAndColumn[1], 10) - 1;
        const errorPosition = new vscode.Position(line, column);
        const range = select.selectContainingForm(doc, errorPosition);
        return range;
    }
}

function normalizeNewLines(strings: string[]): string {
    return strings.map(x => x.replace(/\n\r?$/, "")).join("\n");
}

function evaluateSelectionReplace(document = {}, options = {}) {
    evaluateSelection(document, Object.assign({}, options, { replace: true, pprint: state.config().pprint }));
}

function evaluateSelectionAsComment(document = {}, options = {}) {
    evaluateSelection(document, Object.assign({}, options, { comment: true, pprint: state.config().pprint }));
}

function evaluateTopLevelFormAsComment(document = {}, options = {}) {
    evaluateSelection(document, Object.assign({}, options, { comment: true, topLevel: true, pprint: state.config().pprint }));
}

function evaluateTopLevelForm(document = {}, options = {}) {
    evaluateSelection(document, Object.assign({}, options, { topLevel: true, pprint: state.config().pprint }));
}

function evaluateCurrentForm(document = {}, options = {}) {
    evaluateSelection(document, Object.assign({}, options, { pprint: state.config().pprint }));
}

async function loadFile(document = {}, callback = () => { }) {
    let current = state.deref(),
        doc = util.getDocument(document),
        fileName = util.getFileName(doc),
        fileType = util.getFileType(doc),
        client = util.getSession(util.getFileType(doc)),
        chan = state.outputChannel(),
        shortFileName = path.basename(fileName),
        dirName = path.dirname(fileName);

    if (doc && doc.languageId == "clojure" && fileType != "edn" && current.get('connected')) {
        state.analytics().logEvent("Evaluation", "LoadFile").send();
        chan.appendLine("Evaluating file: " + fileName);

        let value = await client.loadFile(doc.getText(), {
            fileName: fileName,
            filePath: doc.fileName,
            stdout: m => chan.appendLine(m.indexOf(dirName) < 0 ? m.replace(shortFileName, fileName) : m),
            stderr: m => chan.appendLine(m.indexOf(dirName) < 0 ? m.replace(shortFileName, fileName) : m)
        }).value;

        if (value !== null)
            chan.appendLine("=> " + value);
        else
            chan.appendLine("No results from file evaluation.");
    }
    callback();
}

async function requireREPLUtilitiesCommand() {
    const chan = state.outputChannel(),
        replWindow = activeReplWindow(),
        session: NReplSession = replWindow ? replWindow.session : util.getSession(util.getFileType(util.getDocument({}))),
        CLJS_FORM = "(use '[cljs.repl :only [apropos dir doc find-doc print-doc pst source]])",
        CLJ_FORM = "(clojure.core/apply clojure.core/require clojure.main/repl-requires)",
        form = util.getREPLSessionType() == "cljs" ? CLJS_FORM : CLJ_FORM;
    await session.eval(form);
    chan.appendLine("REPL utilities (like apropos, dir, doc, find-doc, pst, and source) are now available.");
}

async function copyLastResultCommand() {
    let chan = state.outputChannel();
    const replWindow = activeReplWindow();
    let client = replWindow ? replWindow.session : util.getSession(util.getFileType(util.getDocument({})));

    let value = await client.eval("*1").value;
    if (value !== null) {
        vscode.env.clipboard.writeText(value);
        vscode.window.showInformationMessage("Results copied to the clipboard.");
    }
    else
        chan.appendLine("Nothing to copy");
}

async function togglePrettyPrint() {
    const config = vscode.workspace.getConfiguration('calva');
    const pprintConfigKey = 'prettyPrint';
    const pprint = config.get(pprintConfigKey);
    await config.update(pprintConfigKey, !pprint, vscode.ConfigurationTarget.Global);
    statusbar.update();
};

export default {
    loadFile,
    evaluateCurrentForm,
    evaluateTopLevelForm,
    evaluateSelectionReplace,
    evaluateSelectionAsComment,
    evaluateTopLevelFormAsComment,
    copyLastResultCommand,
    requireREPLUtilitiesCommand,
    togglePrettyPrint
};
