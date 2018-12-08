import { window, Range, TreeDataProvider, EventEmitter, Event, TreeItemCollapsibleState, TreeItem, ProviderResult, TextDocumentShowOptions, Uri } from 'vscode';

export type Outcome = 'pass' | 'error' | 'fail';

export type Assertion = {
    index: number
    ns: string
    file?: string
    type: Outcome
    diffs?: string[][]
    line?: number
    'var': string
    expected?: string
    context?: any[] | string
    error?: string
    message?: string
}

// A map from namespace => var => boolean
// true if the running the test was successful.
type Results = {
    [namespace: string]: {
        [varname: string]: Assertion[]
    }
}

type NamespaceNode = {
    type: 'ns'
    ns: string
}

type VarNode = {
    type: 'var'
    varName: string
    nsName: string
}

type AssertionNode = {
    type: 'assertion'
    varName: string
    nsName: string
    index: number
}

/*
index:0
ns:"orb-service-client-test"
file:"/Users/marc/dev/circleci/orb-service/client/test/orb_service_client_test.clj"
type:"fail"
line:33
var:"this-just-throws"
expected:"false
"
context:Array[0]
actual:"false
"
message:Array[0]
Object
index:1
ns:"orb-service-client-test"
file:"core.clj"
type:"error"
fault:"true"
line:36
var:"this-just-throws"
context:Array[0]
error:"clojure.lang.ExceptionInfo: horse {:cat 7}"
message:"Uncaught exception, not in assertion"
*/

export function goToFile(file: string, line: number) {
    console.log('go to file');
    console.log('go to file', file, line);
    window.showTextDocument(Uri.file(file), {
        selection: new Range(line, 0, line, 0)
    });
}

// The test result tree-view has 2 type of node:
// Namespace nodes and var nodes.
// The (root) contains NamespaceNodes, which have VarNodes as children.
type TestNode = NamespaceNode | VarNode | AssertionNode

class ClojureTestDataProvider implements TreeDataProvider<TestNode> {

    onTestResult(assertions: Assertion[]): void {

        console.log(assertions);

        // Make a copy of result with the new result assoc'ed in.

        if (assertions.length == 0) {
            return;
        }

        const ns = assertions[0].ns;
        const varName = assertions[0]['var'];

        this.results = {
            ...this.results,
            [ns]: {
                ...this.results[ns],
                [varName]: assertions
            }
        }

        this.testsChanged.fire(); // Trigger the UI to update.
    }

    private testsChanged: EventEmitter<TestNode> = new EventEmitter<TestNode>();
    readonly onDidChangeTreeData: Event<TestNode | undefined | null> = this.testsChanged.event;

    private results: Results = {}

    getNamespaceItem(element: NamespaceNode): TreeItem {
        return {
            label: element.ns,
            collapsibleState: TreeItemCollapsibleState.Expanded
        };
    }

    getVarItem(element: VarNode): TreeItem {

        const assertions = this.results[element.nsName][element.varName];

        const passing = assertions.reduce((prev, it) => prev && it.type == 'pass', true);

        return {
            label: element.varName,
            collapsibleState: passing? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.Expanded
        };
    }

    getAssertionItem(element: AssertionNode): TreeItem {
        const assertion = this.results[element.nsName][element.varName][element.index]


        return {
            label: "" + assertion.context + " " + (assertion.type == 'pass' ? "✅ " : "❌ ") + "Assertion " + assertion.index,
            collapsibleState: TreeItemCollapsibleState.None

            //command: {
             //   title: "GOt0",
             //   command: "calva.openFile",
            //    arguments: [outcome.file, outcome.line]
            //}
        };
    }

    getTreeItem(element: TestNode): TreeItem | Thenable<TreeItem> {
        switch (element.type) {
            case 'ns': return this.getNamespaceItem(element);
            case 'var': return this.getVarItem(element);
            case 'assertion': return this.getAssertionItem(element);
        }
    }

    getChildren(element?: TestNode): ProviderResult<TestNode[]> {

        if (!element) {
            return Object.keys(this.results).map((ns) => {
                const node: NamespaceNode = {
                    type: 'ns',
                    ns: ns
                };
                return node;
            });

        }

        switch (element.type) {
            case 'ns': {
                const vars = Object.keys(this.results[element.ns]);

                return vars.map((varName) => {
                    const node: VarNode = {
                        type: 'var',
                        nsName: element.ns,
                        varName: varName
                    };
                    return node;
                });
            }
            case 'var': {
                const assertions = this.results[element.nsName][element.varName];
                return assertions.map((a, idx) => {
                    const node: AssertionNode = {
                        type: 'assertion',
                        nsName: a.ns,
                        varName: a['var'],
                        index: idx
                    };
                    return node;
                });
            }
        }
        return null;
    }
}

export const testDataProvider: ClojureTestDataProvider = new ClojureTestDataProvider();
