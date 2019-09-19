import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';
import * as jsonc from 'jsonc-parser';
import { extractIdentifier } from './identifierUtil';


export class FlintDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private jsonInfo : JsonInfo) {
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        const offset = document.offsetAt(position);

        const definition = this.jsonInfo.modelValidator.getDefintionForOffset(offset);

        if (definition) {
            const linePosition = document.positionAt(definition.offset);
            return Promise.resolve(new vscode.Location(document.uri, linePosition));  
        }
        
        return Promise.resolve(null);
    }

}