import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';
import { extractIdentifier } from './identifierUtil';
import * as jsonc from 'jsonc-parser';

export class FlintReferenceProvider implements vscode.ReferenceProvider {
    constructor(private jsonInfo : JsonInfo) {
    }
    
    provideReferences(document: vscode.TextDocument, position: vscode.Position, context: vscode.ReferenceContext, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location[]> {
        console.log("Finding references");
        
        const offset = document.offsetAt(position);

        return Promise.resolve(this.jsonInfo.modelValidator.getReferencesForOffset(offset)
        .map((identifierInfo: { offset: number; }) => {
            const linePosition = document.positionAt(identifierInfo.offset);
            return new vscode.Location(document.uri, linePosition);   
        }));
    }

}