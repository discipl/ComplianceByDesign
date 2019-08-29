import * as vscode from 'vscode';
import * as fs from 'fs';

export class FlintFactNodeProvider implements vscode.TreeDataProvider<FactNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<FactNode | undefined> = new vscode.EventEmitter<FactNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<FactNode | undefined> = this._onDidChangeTreeData.event;
    
    constructor() {

    }
    
    getTreeItem(element: FactNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FactNode | undefined): Thenable<FactNode[]> {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            return Promise.resolve(this.getFactsFromJson());
        }
    }

    private getFactsFromJson(): FactNode[] {
        if (vscode.window.activeTextEditor) {
            const flintModelFile = vscode.window.activeTextEditor.document.fileName;
            const model = JSON.parse(fs.readFileSync(flintModelFile, 'utf-8'));

            return model!.facts.map((fact: any) => new FactNode(fact.fact, vscode.TreeItemCollapsibleState.Collapsed));
        }
        
        return [];
    }
}

export class FactNode extends vscode.TreeItem {
    constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState
	) {
		super(label, collapsibleState);
	}
}