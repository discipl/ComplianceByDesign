import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';

import { LawReg } from '@discipl/law-reg';

export class FlintDiagnosticManager {
    private lawReg : any = new LawReg();
    constructor(private collection: vscode.DiagnosticCollection, private jsonInfo: JsonInfo) {
        console.log("Initialized manager");
        this.computeDiagnostics();
        jsonInfo.dataUpdated(() => this.computeDiagnostics());
    }

    private computeDiagnostics() {
        // console.log("Computing errors");
        const document = vscode.window.activeTextEditor!.document;

        const errors = this.jsonInfo.modelValidator.getDiagnostics().map((diagnostic: { offset: number[]; code: any; message: any; severity: any; source: any; }) => {
            const beginPosition = document.positionAt(diagnostic.offset[0]); 
            const endPosition = document.positionAt(diagnostic.offset[1]);
            return {
                code: diagnostic.code,
                message: diagnostic.message,
                range: new vscode.Range(beginPosition, endPosition),
                severity: diagnostic.severity,
                source: diagnostic.source,
                relatedInformation: []
            }
        })
        
        this.collection.set(document.uri, errors);
    }
}