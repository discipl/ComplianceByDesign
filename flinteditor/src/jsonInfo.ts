import * as vscode from 'vscode';
import * as fs from 'fs';
import * as jsonc from 'jsonc-parser';
import { extractIdentifiersFromString } from './identifierUtil';
import { EventEmitter } from 'events';

export interface IdentifierPaths { [s: string]: [string, number, string]; }
export interface ReferencePaths { [s: string]: [string, number, string][]; }

export class JsonInfo {
    public tree : jsonc.Node = jsonc.parseTree("{}");
    public model : any = {};
    public raw : string = "";
    public identifierPaths : IdentifierPaths = {};
    public referencePaths : ReferencePaths = {};

    private document : vscode.TextDocument | undefined;

    private _dataUpdated : vscode.EventEmitter<null> = new vscode.EventEmitter<null>();
    public dataUpdated : vscode.Event<null> = this._dataUpdated.event;

    constructor() {        
        this.computeData();

        vscode.workspace.onDidSaveTextDocument(() => this.computeData());
    }

    private computeData() {
        if (vscode.window.activeTextEditor) {
            const flintModelDocument = vscode.window.activeTextEditor.document;
            this.document = flintModelDocument;
            const flintJson = fs.readFileSync(flintModelDocument.fileName, 'utf-8');
            this.tree = jsonc.parseTree(flintJson);
            this.model = JSON.parse(flintJson);
            this.raw = flintJson;
            this.identifierPaths = {};
            this.referencePaths = {};
            const identifierFields = [["acts", "act"], ["facts", "fact"], ["duties", "duty"]];
            for (let identifierField of identifierFields) {
                this.identifierPaths = this.model[identifierField[0]].reduce((acc: any, _item: any, index: number) => {
                    const path = [identifierField[0], index, identifierField[1]];
                    const node = jsonc.findNodeAtLocation(this.tree, path);
                    acc[node!.value] = path;
                    return acc;
                }, this.identifierPaths);
            }
            console.log('IdentifierLocations', this.identifierPaths);
            const indexedFields = [['acts', 'actor'], ['acts', 'object'], ['acts', 'interested-party'],
            ['acts', 'preconditions'], ['acts', 'create'], ['acts', 'terminate'],
            ['facts', 'function'],
            ['duties', 'duty-components'], ['duties', 'duty-holder'], ['duties', 'duty-holder'], ['duties', 'claimant'], ['duties', 'create'], ['duties', 'terminate']];
            for (let indexField of indexedFields) {
                this.referencePaths = this.model[indexField[0]].reduce((acc: ReferencePaths, item: any, index: number) => {
                    //console.log("Reducing");
                    const path: [string, number, string] = [indexField[0], index, indexField[1]];
                    const node = jsonc.findNodeAtLocation(this.tree, path);
                    const identifiers = extractIdentifiersFromString(node!.value);
                    if (identifiers) {
                        for (let identifer of identifiers) {
                            if (acc[identifer]) {
                                acc[identifer].push(path);
                            }
                            else {
                                acc[identifer] = [path];
                            }
                        }
                    }
                    return acc;
                }, this.referencePaths);
            }
            this._dataUpdated.fire();
        }
    }
}