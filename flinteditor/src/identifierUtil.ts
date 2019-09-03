import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';
import * as jsonc from 'jsonc-parser';

export function extractIdentifier(document: vscode.TextDocument, position: vscode.Position, jsonInfo: JsonInfo) : string {

    const offset = document.offsetAt(position);

    const location = jsonc.getLocation(jsonInfo.raw, offset);


    
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
    return identifier;
}

export function extractIdentifiersFromString(str: string) : string[] {

    const regex = /(\[.*\])|(<<.*>>)|(<.*>)/g;

    const result : string[] = [];
    let match = null;
    while (match = regex.exec(str)) {
        if (!result.includes(match[0])) {
            result.push(match[0]);
        }
    }

    return result;
}