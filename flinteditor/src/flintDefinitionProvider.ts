import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';
import * as jsonc from 'jsonc-parser';
import { extractIdentifier } from './identifierUtil';


export class FlintDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private jsonInfo : JsonInfo) {
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        const tree = this.jsonInfo.tree;

        const identifier = extractIdentifier(document, position, this.jsonInfo);
        if (identifier.length > 0) {
            console.log("Checking presence in identifierLocations");
            if (this.jsonInfo.identifierPaths[identifier]) {
                const node = jsonc.findNodeAtLocation(this.jsonInfo.tree, this.jsonInfo.identifierPaths[identifier]);

                const linePosition = document.positionAt(node!.offset);

                return Promise.resolve(new vscode.Location(document.uri, linePosition));   
            }
        }

        return Promise.resolve(null);
    }

}