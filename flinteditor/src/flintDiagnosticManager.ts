import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';

import * as jsonc from 'jsonc-parser';

import { LawReg } from '@discipl/law-reg';

export class FlintDiagnosticManager {
    private lawReg : any = new LawReg();
    constructor(private collection: vscode.DiagnosticCollection, private jsonInfo: JsonInfo) {
        console.log("Initialized manager");
        this.computeDiagnostics();
        jsonInfo.dataUpdated(() => this.computeDiagnostics());
    }

    private computeDiagnostics() {
        console.log("Computing errors");
        const document = vscode.window.activeTextEditor!.document;
        

        const actNameValidationErrors = this.checkIdentifiers(document, "acts", "act", /^<<.*>>$/);
        const factNameValidationErrors = this.checkIdentifiers(document, "facts", "fact", /^\[.*\]$/);
        const dutyNameValidationErrors = this.checkIdentifiers(document, "duties", "duty", /^<.*>$/);

        const referenceErrors = this.checkReferences(document);

        const errors = actNameValidationErrors.concat(factNameValidationErrors, dutyNameValidationErrors, referenceErrors);
        this.collection.set(document.uri, errors);
    }

    private checkIdentifiers(document: vscode.TextDocument, flintItems: string, flintItem: string, pattern: RegExp) : vscode.Diagnostic[] {
        const identifierValidationErrors : vscode.Diagnostic[] = this.jsonInfo.model[flintItems]
        .filter((item: any) => typeof item[flintItem] !== 'string' || !item[flintItem].match(pattern))
        .map((item: any) => {
            const node = jsonc.findNodeAtLocation(this.jsonInfo.tree, this.jsonInfo.identifierPaths[item[flintItem]]);
            const beginPosition = document.positionAt(node!.offset); 
            const endPosition = document.positionAt(node!.offset + node!.length);

            return {
                code: '',
                message: 'Invalid name',
                range: new vscode.Range(beginPosition, endPosition),
                severity: vscode.DiagnosticSeverity.Error,
                source: item[flintItem].toString(),
                relatedInformation: []
            };
        });

        return identifierValidationErrors;
    }

    private checkReferences(document: vscode.TextDocument) : vscode.Diagnostic[] {
        const createTerminateErrors = this.jsonInfo.model.acts.flatMap((act: any) => {
            const basePath = this.jsonInfo.identifierPaths[act.act];
            const createNode = jsonc.findNodeAtLocation(this.jsonInfo.tree, [basePath[0], basePath[1], 'create']);
            const terminateNode = jsonc.findNodeAtLocation(this.jsonInfo.tree, [basePath[0], basePath[1], 'terminate']);

            const createErrors = this.checkCreateTerminate(act.create, document, createNode!.offset);
            const terminateErrors = this.checkCreateTerminate(act.terminate, document, terminateNode!.offset);
            return createErrors.concat(terminateErrors);
        });

        const veryStrict : string[] = [];
        const lessStrict = [""];
        const factStrict = ["<<>>", "[]"];
        const expressionCheckInfo : [string, string, string[]][] = [['acts', 'actor', veryStrict], ['acts', 'object', veryStrict], ['acts', 'interested-party', veryStrict], 
                        ['acts', 'preconditions', lessStrict], ['facts', 'function', factStrict]];

        const expressionErrors = expressionCheckInfo.flatMap((expressionCheckPath : [string, string, string[]]) => {
            return this.jsonInfo.model[expressionCheckPath[0]].flatMap((item: any, index: number) => {
                const node = jsonc.findNodeAtLocation(this.jsonInfo.tree, [expressionCheckPath[0], index, expressionCheckPath[1]]);
                console.log("ExpCheck en index", expressionCheckPath, index);
                return this.validateExpression(node!.value, document, node!.offset, expressionCheckPath[2]);
            });
        })

        return createTerminateErrors.concat(expressionErrors);
    }

    private checkCreateTerminate(referenceString: string, document: vscode.TextDocument, beginOffset: number) : vscode.Diagnostic[] {
        const createTerminateErrors = [];
        const parsedReferences = referenceString.split(';').map(item => item.trim());
  
        for (let reference of parsedReferences) {
            if (reference.trim() === "") {
                continue;
            }
            const subPosition = referenceString.indexOf(reference);
            const error = this.validateReference(reference, document, beginOffset + subPosition);

            if (error) {
                createTerminateErrors.push(error);
            }
        }
  
        return createTerminateErrors;
    }

    private validateReference(reference: string, document: vscode.TextDocument, beginOffset: number): vscode.Diagnostic | undefined {
        if (!this.jsonInfo.identifierPaths[reference]) {
            const beginPosition = document.positionAt(beginOffset);
            const endPosition = document.positionAt(beginOffset + reference.length);
            return {
                code: '',
                message: 'Undefined fact',
                range: new vscode.Range(beginPosition, endPosition),
                severity: vscode.DiagnosticSeverity.Warning,
                source: reference,
                relatedInformation: []
            }
        }
    }

    private validateParsedExpression(expression: any, document: vscode.TextDocument, beginOffset: number, originalExpression: string) : vscode.Diagnostic[] {
        let errors = [];
        if (typeof expression === 'string') {
            const extraOffset = JSON.stringify(originalExpression).indexOf(expression);
            const error = this.validateReference(expression, document, beginOffset + extraOffset);
            if (error) {
                errors.push(error);
            }
        }

        if (expression.operands) {
            for (let operand of expression.operands) {
                errors = errors.concat(this.validateParsedExpression(operand, document, beginOffset, originalExpression));
            }
        }

        if (expression.operand) {
            errors = errors.concat(this.validateParsedExpression(expression.operand, document, beginOffset, originalExpression));
        }

        return errors;
    }

    private validateExpression(expression: string, document: vscode.TextDocument, beginOffset: number, exceptions: string[]) : vscode.Diagnostic[] {
          try {
              if (exceptions.includes(expression.trim())) {
                  return [];
              }
            let parsedFact = this.lawReg.factParser.parse(expression);
            return this.validateParsedExpression(parsedFact, document, beginOffset, expression);
          } catch (e) {
            if (e.name === 'SyntaxError') {
                const beginPosition = document.positionAt(beginOffset);
            const endPosition = document.positionAt(beginOffset + expression.length);
                return [{
                    code: '',
                    message: 'Syntax Error: ' + e.message,
                    range: new vscode.Range(beginPosition, endPosition),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: expression,
                    relatedInformation: []
                }];
            } else {
              throw e;
            }
          }
        }

}