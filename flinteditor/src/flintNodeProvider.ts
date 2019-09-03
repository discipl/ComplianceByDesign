import * as vscode from 'vscode';
import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';
import { JsonInfo } from './jsonInfo';

export class FlintNodeProvider implements vscode.TreeDataProvider<ActNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<ActNode | undefined> = new vscode.EventEmitter<ActNode | undefined>();
	readonly onDidChangeTreeData: vscode.Event<ActNode | undefined> = this._onDidChangeTreeData.event;
    
    constructor(private jsonInfo : JsonInfo, private type : string) {
        this.jsonInfo.dataUpdated(() => {this._onDidChangeTreeData.fire();}, this);
    }
    
    getTreeItem(element: ActNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ActNode | undefined): Thenable<ActNode[]> {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            return this.getActsFromJson();
        }
    }

    private async getActsFromJson(): Promise<ActNode[]> {
        if (vscode.window.activeTextEditor) {
            const parsedJson = this.jsonInfo.tree;

            return Object.entries(this.jsonInfo.identifierPaths).filter((identifierPath) => {
                //console.log("Considering identifier with path", identifierPath);
                return identifierPath[1][0] === this.type;
            }).map((identifierPath) => {
                //console.log('Setting command for', identifierPath);
                const node = jsonc.findNodeAtLocation(parsedJson, identifierPath[1]);
                const linePosition = vscode.window.activeTextEditor!.document.positionAt(node!.offset);
                
                return new ActNode(identifierPath[0], vscode.TreeItemCollapsibleState.None, {
                    command: 'extension.navToLine',
                    title: '',
                    arguments: [linePosition.line]
                });
            });
        }
        
        return [];
    }
}

export class ActNode extends vscode.TreeItem {
    constructor(
		public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState, 
        public command : vscode.Command | undefined
	) {
        super(label, collapsibleState);
        
	}
}