import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';
import * as jsonc from 'jsonc-parser';
import { match } from 'minimatch';


export class FlintDefinitionProvider implements vscode.DefinitionProvider {
    constructor(private jsonInfo : JsonInfo) {
    }

    provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Location | vscode.Location[] | vscode.LocationLink[]> {
        const tree = this.jsonInfo.tree;

        const offset = document.offsetAt(position);

        const location = jsonc.getLocation(this.jsonInfo.raw, offset);


        
        const value = location.previousNode!.value;
        const offsetInValue = offset - location.previousNode!.offset;

        console.log("Finding factidentifiers in value", value);
        const regex = /(\[.*\])|(<<.*>>)|(<.*>)/g;
        let identifier : string = "";
        let m = null;
        while (m = regex.exec(value)) {
            console.log(m);
            console.log("index", m.index);
            console.log("offsetInValue", offsetInValue);
            if (m.index <= offsetInValue && m.index + m[0].length >= offsetInValue) {
                identifier = m[0];
                break;
            }

        }
        console.log("Identifier", identifier);

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