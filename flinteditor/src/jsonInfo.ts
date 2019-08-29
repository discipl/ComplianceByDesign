import * as vscode from 'vscode';
import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';

export interface IdentifierPaths { [s: string]: [string, number, string]; }

export class JsonInfo {
    public tree : jsonc.Node;
    public model : any;
    public raw : string;
    public identifierPaths : IdentifierPaths;

    constructor() {
        if (vscode.window.activeTextEditor) {
            //await vscode.commands.executeCommand('revealLine', {lineNumber: 15, at: 'top'});
            const flintModelDocument = vscode.window.activeTextEditor.document;
            const flintJson = fs.readFileSync(flintModelDocument.fileName, 'utf-8');
            this.tree = jsonc.parseTree(flintJson);
            this.model = JSON.parse(flintJson);
            this.raw = flintJson;

            this.identifierPaths = this.model.facts.reduce((acc: any, fact: any, index: number) => {
                const node = jsonc.findNodeAtLocation(this.tree, ["facts", index, "fact"]);
                acc[node!.value] = ["facts", index, "fact"];
                return acc;
            }, {});

            this.identifierPaths = this.model.acts.reduce((acc: any, act: any, index: number) => {
                const node = jsonc.findNodeAtLocation(this.tree, ["acts", index, "act"]);

                acc[node!.value] = ["acts", index, "act"];
                return acc;
            }, this.identifierPaths);

            this.identifierPaths = this.model.duties.reduce((acc: any, duty: any, index: number) => {
                const node = jsonc.findNodeAtLocation(this.tree, ["duties", index, "duty"]);
                acc[node!.value] = ["duties", index, "duty"];
                return acc;
            }, this.identifierPaths);

            console.log('IdentifierLocations', this.identifierPaths);
        }
        else {
            this.model = {};
            this.raw = "";
            this.tree = jsonc.parseTree("{}");
            this.identifierPaths = {};
        }
    }
}