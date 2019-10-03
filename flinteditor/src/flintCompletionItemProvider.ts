import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';

export class FlintCompletionItemProvider implements vscode.CompletionItemProvider {
    private actIdentifiers : string[] = [];
    private factIdentifiers : string[] = [];
    private dutyIdentifiers : string[] = [];
    constructor(jsonInfo: JsonInfo) {
        console.log("Instantiating FlintCompletionItemProvider");
        this.actIdentifiers = jsonInfo.modelValidator.getDefinitionsForType('acts').map((definition: { identifier: any; }) => definition.identifier);
        this.factIdentifiers = jsonInfo.modelValidator.getDefinitionsForType('facts').map((definition: { identifier: any; }) => definition.identifier);
        this.dutyIdentifiers = jsonInfo.modelValidator.getDefinitionsForType('duties').map((definition: { identifier: any; }) => definition.identifier);
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const line = document.lineAt(position);
        const lineOffset = document.offsetAt(line.range.start);
        
        const offset = document.offsetAt(position);

        const offsetInLine = offset - lineOffset;

        console.log("Info", line.text, offsetInLine, this.actIdentifiers);

        const actCompletionItems = this.checkFor('<<', line.text, offsetInLine, this.actIdentifiers, position);
        const factCompletionItems = this.checkFor('[', line.text, offsetInLine, this.factIdentifiers, position);
        const dutyCompletionItems = this.checkFor('<', line.text, offsetInLine, this.dutyIdentifiers, position);

        const result = actCompletionItems.concat(factCompletionItems, dutyCompletionItems);

        console.log("Final result", result);
        const doc = vscode.window.activeTextEditor!.document;
        console.log(doc.getText(doc.getWordRangeAtPosition(position)));
        return result;
    }

    checkFor(searchValue: string, line: string, offsetInLine: number, identifiers: string[], cursorPosition: vscode.Position) : vscode.CompletionItem[] {
        let autocompletions : vscode.CompletionItem[] = [];
        const beginOfIdentifier = line.lastIndexOf(searchValue, offsetInLine);
        if (beginOfIdentifier !== -1) {
            const identifierBegin = line.substring(beginOfIdentifier, offsetInLine);
            autocompletions = identifiers.filter(identifier => {
                console.log('Considering', identifier);
                return identifier.startsWith(identifierBegin);
            })
                .map(identifier => {
                const beginEditPosition = cursorPosition.translate(0, beginOfIdentifier - offsetInLine);
                // return new vscode.CompletionItem(identifier.substring(identifierBegin.length));
                const completion = new vscode.CompletionItem(identifier);
                completion.filterText = identifier;
                completion.insertText = identifier;
                completion.range = new vscode.Range(beginEditPosition, cursorPosition);
                return completion;
            }
        );
        }
        return autocompletions;
    }

}