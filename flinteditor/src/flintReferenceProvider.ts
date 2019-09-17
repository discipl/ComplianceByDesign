import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';
import { extractIdentifier } from './identifierUtil';
import * as jsonc from 'jsonc-parser';

export class FlintReferenceProvider implements vscode.ReferenceProvider {
    constructor(private jsonInfo : JsonInfo) {
    }
    
    provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
        const identifier = extractIdentifier(document, position, this.jsonInfo);

        // console.log("Reference paths for identifier", this.jsonInfo.referencePaths[identifier]);
        if (this.jsonInfo.referencePaths[identifier]) {
            const references = this.jsonInfo.referencePaths[identifier].map((referencePath) => {
                // console.log("looking up node for", referencePath);
                const node = jsonc.findNodeAtLocation(this.jsonInfo.tree, referencePath);

                const linePosition = document.positionAt(node!.offset);

                // console.log("Line position", linePosition);
                return new vscode.Location(document.uri, linePosition);   
            });

            return references;
        }
        
        return Promise.resolve(null);
    }

}