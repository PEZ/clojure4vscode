import * as vscode from 'vscode';
import * as _ from 'lodash';
import * as state from '../../state';
import repl from '../client';
import evaluate from './evaluate';
import * as util from '../../utilities';
import {Outcome, testDataProvider} from '../../providers/testData'

import * as calvaLib from '../../../lib/calva';

let diagnosticCollection = vscode.languages.createDiagnosticCollection('calva');

function markTestResults(responsesArray, log = true) {
    let chan = state.deref().get('outputChannel'),
        diagnostics = {},
        total_summary: { test, error, ns, var, fail } = { test: 0, error: 0, ns: 0, var: 0, fail: 0 };
    diagnosticCollection.clear();
    _.each(responsesArray, (responses) => {
        _.each(responses, response => {
            let results = response.results || null,
                summary = response.summary || null;
            if (results !== null) {
                _.each(results, (tests, ns) => {
                    _.each(tests, (asserts, test) => {
                        testDataProvider.onTestResult(asserts);

                        _.each(asserts, a => {

                            if (a.type == "error") {
                                if (log) {
                                    chan.appendLine("ERROR in: " + ns + ": " + a.file + ", line " + a.line +
                                        ": " + test + ": " + (a.context || "") + ":\n" +
                                        "  error: " + a.error + "\n  expected: " + a.expected);
                                }
                            }
                            if (a.type == "fail") {
                                let msg = "failure in test: " + test +
                                    " context: " + a.context + ", expected " +
                                    a.expected + ", got: " + a.actual,
                                    err = new vscode.Diagnostic(new vscode.Range(a.line - 1, 0, a.line - 1, 1000),
                                        msg,
                                        vscode.DiagnosticSeverity.Error);
                                if (!diagnostics[a.file]) {
                                    diagnostics[a.file] = [];
                                }
                                diagnostics[a.file].push(err);
                                if (log) {
                                    chan.appendLine("FAIL in: " + a.file + ":" + a.line +
                                        ": " + test + ": " + (a.context || "") + ":\n" +
                                        "  expected: " + a.expected + "\n  actual: " + a.actual);
                                }
                            }
                        })
                    })
                })
            }
            if (summary !== null) {
                _.each(summary, (v, k) => {
                    total_summary[k] = summary[k] + (total_summary[k] !== undefined ? total_summary[k] : 0);
                });
            }
        });
    });
    if (total_summary !== null) {
        let hasProblems = total_summary.error + total_summary.fail > 0;
        if (log) {
            chan.appendLine("\n" + (total_summary.test > 0 ?
                total_summary.test + " tests finished, " +
                (!hasProblems ? "all passing 👍" :
                    "problems found. 😭" +
                    " errors: " + total_summary.error + ", failures: " + total_summary.fail) :
                "No tests found. 😱") +
                ", ns: " + total_summary.ns + ", vars: " + total_summary.var);
        }

        if (total_summary.test > 0) {
            if (hasProblems) {
                _.each(diagnostics, (errors, fileName) => {
                    if (fileName.startsWith('/')) {
                        diagnosticCollection.set(vscode.Uri.file(fileName), errors);
                    }
                    else {
                        // Sometimes we don't get the full path for some reason. (This is a very inexact
                        // way of dealing with that. Maybe check for the right `ns`in the file?)
                        vscode.workspace.findFiles('**/' + fileName, undefined).then((uri) => {
                            diagnosticCollection.set(uri[0], errors);
                        });
                    }
                });
            }
        }
    }
}

function runTests(messages, startStr, errorStr, log = true) {
    let current = state.deref(),
        chan = current.get('outputChannel');

    if (current.get('connected')) {
        if (log) {
            chan.appendLine(startStr);
        }
        let testClient = null,
            results = [],
            errors = 0,
            exceptions = 0;

        // It seems we cannot set up two connections, lest they get mixed up.
        // Thus we only send new messages when a message has returned.
        (function loop(i) {
            new Promise((resolve, reject) => {
                testClient = calvaLib.nrepl_create(repl.getDefaultOptions()).once('connect', () => {
                    testClient.send(messages[i], (result) => {
                        exceptions += (_.some(result, "ex") ? 1 : 0);
                        errors += (_.some(result, "err") ? 1 : 0);
                        if (!exceptions && !errors) {
                            resolve(result);
                        } else {
                            util.logError({
                                type: util.ERROR_TYPE.ERROR,
                                reason: "Error " + errorStr + ":" + _.find(result, "err").err
                            });
                            reject(result);
                        }
                    });
                });
            }).then((result) => {
                testClient.end();
                results.push(result);
                if (i < messages.length - 1) {
                    loop(i + 1);
                } else {
                    let msgs = calvaLib.migration_jsify(messages);
                    if ((msgs[0].op === calvaLib.migration_jsify(calvaLib.message_operation).RETEST) && (results[0][0]["testing-ns"].length < 1)) {
                        chan.appendLine("No tests to rerun. (They probably all passed last time 🤘)")
                    } else {
                        markTestResults(results);
                    }
                }
            }).catch(() => {
                testClient.end();
            });
        })(0);
    }
}

function runAllTests(document = {}) {
    let doc = util.getDocument(document),
        session = util.getSession(util.getFileType(doc)),
        msg = calvaLib.message_testAllMsg(session);

    runTests([msg], "Running all tests", "running all tests");
}

function runAllTestsCommand() {
    //let chan = state.deref().get('outputChannel');

    //chan.show();
    runAllTests();
}

function getNamespaceTestMessages(document = {}) {
    let doc = util.getDocument(document),
        session = util.getSession(util.getFileType(doc)),
        ns = util.getNamespace(doc.getText()),
        messages = [calvaLib.message_testMsg(session, ns)];

    if (!ns.endsWith('-test')) {
        messages.push(calvaLib.message_testMsg(session, ns + '-test'));
    }
    return messages;
}

function runNamespaceTests(document = {}) {
    evaluate.evaluateFile({}, () => {
        runTests(getNamespaceTestMessages(document), "Running tests", "running tests");
    });
}

function runNamespaceTestsCommand() {
    //state.deref().get('outputChannel').show(false);
    runNamespaceTests();
}

function rerunTests(document = {}) {
    let doc = util.getDocument(document),
        session = util.getSession(util.getFileType(doc)),
        msg = calvaLib.message_rerunTestsMsg(session);

    evaluate.evaluateFile({}, () => {
        runTests([msg], "Retesting", "retesting");
    });
}

function rerunTestsCommand() {
    //state.deref().get('outputChannel').show();
    rerunTests();
}



export default {
    runNamespaceTests,
    runNamespaceTestsCommand,
    runAllTests,
    runAllTestsCommand,
    rerunTestsCommand
};
