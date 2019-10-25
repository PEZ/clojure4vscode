import * as vscode from 'vscode';
import * as state from '../state';
import * as _ from 'lodash';

enum AnnotationStatus {
    PENDING = 0,
    SUCCESS,
    ERROR,
    REPL_WINDOW
}

const selectionBackgrounds = [
    'rgba(197, 197, 197, 0.07)',
    'rgba(63, 255, 63, 0.05)',
    'rgba(255, 63, 63, 0.06)',
    'rgba(63, 63, 255, 0.1)'
]

const selectionRulerColors = [
    "gray",
    "green",
    "red",
    "blue"
]

const evalResultsDecorationType = vscode.window.createTextEditorDecorationType({
    before: {
        textDecoration: 'none',
        fontWeight: 'normal',
        fontStyle: 'normal',
        width: "250px",
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen
});

function evaluated(contentText, hoverText, hasError) {
    return {
        renderOptions: {
            before: {
                contentText: contentText,
                overflow: "hidden"
            },
            light: {
                before: {
                    color: hasError ? 'rgb(255, 127, 127)' : 'black',
                },
            },
            dark: {
                before: {
                    color: hasError ? 'rgb(255, 175, 175)' : 'white',
                }
            },
        },
    }
}


function createEvalSelectionDecorationType(status: AnnotationStatus) {
    return vscode.window.createTextEditorDecorationType({
        backgroundColor: selectionBackgrounds[status],
        overviewRulerColor: selectionRulerColors[status],
        overviewRulerLane: vscode.OverviewRulerLane.Right,
        rangeBehavior: vscode.DecorationRangeBehavior.OpenOpen,
    })
}

const evalSelectionDecorationTypes = [
    createEvalSelectionDecorationType(AnnotationStatus.PENDING),
    createEvalSelectionDecorationType(AnnotationStatus.SUCCESS),
    createEvalSelectionDecorationType(AnnotationStatus.ERROR),
    createEvalSelectionDecorationType(AnnotationStatus.REPL_WINDOW)
]

function setResultDecorations(editor: vscode.TextEditor, ranges) {
    let key = editor.document.uri + ':resultDecorationRanges';
    state.cursor.set(key, ranges);
    editor.setDecorations(evalResultsDecorationType, ranges);
}

function setSelectionDecorations(editor, ranges, status) {
    let key = editor.document.uri + ':selectionDecorationRanges:' + status;
    state.cursor.set(key, ranges);
    editor.setDecorations(evalSelectionDecorationTypes[status], ranges);
}

function clearEvaluationDecorations(editor?: vscode.TextEditor) {
    if (editor === undefined) {
        editor = vscode.window.activeTextEditor;
    }
    state.cursor.delete(editor.document.uri + ':resultDecorationRanges');
    setResultDecorations(editor, []);
    for (const status in [AnnotationStatus.PENDING, AnnotationStatus.SUCCESS, AnnotationStatus.ERROR, AnnotationStatus.REPL_WINDOW]) {
        state.cursor.delete(editor.document.uri + ':selectionDecorationRanges:' + status);
        setSelectionDecorations(editor, [], status);
    }
    clearCompilationErrors();
}

function decorateResults(resultString, hasError, codeSelection: vscode.Range, editor) {
    let uri = editor.document.uri,
        key = uri + ':resultDecorationRanges',
        decorationRanges = state.deref().get(key) || [],
        decoration = evaluated(` => ${resultString} `, resultString, hasError);
    decorationRanges = _.filter(decorationRanges, (o) => { return !o.codeRange.intersection(codeSelection) });
    decoration["codeRange"] = codeSelection;
    decoration["range"] = new vscode.Selection(codeSelection.end, codeSelection.end);
    decorationRanges.push(decoration);
    setResultDecorations(editor, decorationRanges);
}

function decorateSelection(resultString: string, codeSelection: vscode.Selection, editor: vscode.TextEditor, status: AnnotationStatus) {
    const uri = editor.document.uri,
        key = uri + ':selectionDecorationRanges:' + status;
    let decoration = {},
        decorationRanges = state.deref().get(key) || [];
    decorationRanges = _.filter(decorationRanges, (o) => { return !o.range.intersection(codeSelection) });
    decoration["range"] = codeSelection;
    if (status != AnnotationStatus.PENDING && status != AnnotationStatus.REPL_WINDOW) {
        const commandUri = `command:calva.copyAnnotationHoverText?${encodeURIComponent(JSON.stringify([{text: resultString}]))}`,
            commandMd = `[Copy](${commandUri} "Copy results to the clipboard")`;
        let hoverMessage = new vscode.MarkdownString(commandMd + '\n```clojure\n' + resultString + '\n```');
        hoverMessage.isTrusted = true;
        decoration["hoverMessage"] = status == AnnotationStatus.ERROR ? resultString : hoverMessage;
    }
    // for (let s = 0; s < evalSelectionDecorationTypes.length; s++) {
    //     setSelectionDecorations(editor, [], s);
    // }
    setSelectionDecorations(editor, [], status);
    decorationRanges.push(decoration);
    setSelectionDecorations(editor, decorationRanges, status);
}

function onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
    const activeTextEditor: vscode.TextEditor = vscode.window.activeTextEditor;
    if (activeTextEditor) {
        const activeDocument = activeTextEditor.document,
            changeDocument = event.document;
        if (activeDocument.uri == changeDocument.uri) {
            clearEvaluationDecorations(activeTextEditor);
        }
    }
}

function copyHoverTextCommand(args: { [x: string]: string; }) {
    vscode.env.clipboard.writeText(args["text"]);
}

function markCompilationError(range: vscode.Range, message: string, documentUri: vscode.Uri) {
    const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
    const diagnosticCollection = <vscode.DiagnosticCollection>state.deref().get('compilationDiagnosticCollection');
    diagnosticCollection.set(documentUri, [diagnostic]);
}

function clearCompilationErrors() {
    const diagnosticCollection = state.deref().get('compilationDiagnosticCollection');
    diagnosticCollection.clear();
}

export default {
    AnnotationStatus,
    clearEvaluationDecorations,
    decorateResults,
    decorateSelection,
    onDidChangeTextDocument,
    copyHoverTextCommand,
    markCompilationError,
    clearCompilationErrors,
};