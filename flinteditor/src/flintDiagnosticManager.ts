import * as vscode from 'vscode';
import { JsonInfo } from './jsonInfo';

import * as jsonc from 'jsonc-parser';

export class FlintDiagnosticManager {
    constructor(private collection: vscode.DiagnosticCollection, private jsonInfo: JsonInfo) {
        console.log("Initialized manager");
        this.computeDiagnostics();
        jsonInfo.dataUpdated(() => this.computeDiagnostics());
    }

    private computeDiagnostics() {
        console.log("Computing errors");
        const document = vscode.window.activeTextEditor!.document;
        const errors = [];

        const actNameValidationErrors : vscode.Diagnostic[] = this.jsonInfo.model.acts
        .filter((act: any) => typeof act.act !== 'string' || !act.act.match(/^<<.*>>$/))
        .map((act: any) => {
            const node = jsonc.findNodeAtLocation(this.jsonInfo.tree, this.jsonInfo.identifierPaths[act]);
            const beginPosition = document.positionAt(node!.colonOffset!+2); 
            const endPosition = document.positionAt(node!.offset + node!.length);

            return {
                code: '',
                message: 'Invalid name',
                range: new vscode.Range(beginPosition, endPosition),
                severity: vscode.DiagnosticSeverity.Error,
                source: act.act.toString(),
                relatedInformation: []
            };
        });

        this.collection.set(document.uri, actNameValidationErrors);
    }

    // validate (model : any) {
    //     const errors = []
    
    //     // The defined acts are not actually used, but the syntax is checked here
    //     model.acts.reduce((map, act) => {
    //       if (typeof act.act === 'string' && act.act.startsWith('<<') && act.act.endsWith('>>')) {
    //         map[act.act] = true
    //       } else {
    //         errors.push({
    //           'type': 'error',
    //           'field': 'act/act',
    //           'message': 'Invalid name:' + act.act.toString()
    //         })
    //       }
    //       return map
    //     }, {})
    //     const definedFacts = model.facts.reduce((map, fact) => {
    //       if (typeof fact.fact === 'string' && fact.fact.startsWith('[') && fact.fact.endsWith(']')) {
    //         map[fact.fact] = true
    //       } else {
    //         errors.push({
    //           'type': 'error',
    //           'field': 'fact/fact',
    //           'message': 'Invalid name:' + fact.fact.toString()
    //         })
    //       }
    //       return map
    //     }, {})
    //     const definedDuties = model.duties.reduce((map, duty) => {
    //       if (typeof duty.duty === 'string' && duty.duty.startsWith('<') && duty.duty.endsWith('>')) {
    //         map[duty.duty] = true
    //       } else {
    //         errors.push({
    //           'type': 'error',
    //           'field': 'duty/duty',
    //           'message': 'Invalid name:' + duty.duty.toString()
    //         })
    //       }
    //       return map
    //     }, {})
    
    //     const validateCreateTerminate = (referenceString, field, identifier) => {
    //       const createTerminateErrors = []
    //       const parsedReferences = referenceString.split(';').map(item => item.trim())
    
    //       for (let reference of parsedReferences) {
    //         if (!definedFacts[reference] && !definedDuties[reference]) {
    //           createTerminateErrors.push(
    //             {
    //               'type': 'warning',
    //               'field': field,
    //               'identifier': identifier,
    //               'message': 'Undefined item: ' + reference
    //             }
    //           )
    //         }
    //       }
    
    //       return createTerminateErrors
    //     }
    
    //     const validateAtomicFact = (fact, field, identifier) => {
    //       if (!definedFacts[fact]) {
    //         errors.push({
    //           'type': 'warning',
    //           'field': field,
    //           'identifier': identifier,
    //           'message': 'Undefined fact: ' + fact
    //         })
    //       }
    //     }
    
    //     const validateParsedExpression = (expression, field, identifier) => {
    //       if (typeof expression === 'string') {
    //         validateAtomicFact(expression, field, identifier)
    //       }
    
    //       if (expression.operands) {
    //         for (let operand of expression.operands) {
    //           validateParsedExpression(operand, field, identifier)
    //         }
    //       }
    
    //       if (expression.operand) {
    //         validateParsedExpression(expression.operand, field, identifier)
    //       }
    //     }
    
    //     const validateExpression = (expression, field, identifier) => {
    //       try {
    //         let parsedFact = this.factParser.parse(expression)
    //         validateParsedExpression(parsedFact, field, identifier)
    //       } catch (e) {
    //         if (e.name === 'SyntaxError') {
    //           errors.push({
    //             'type': 'error',
    //             'field': field,
    //             'identifier': identifier,
    //             'message': "Could not parse: '" + expression + "' due to " + e.message
    
    //           })
    //         } else {
    //           throw e
    //         }
    //       }
    //     }
    
    //     for (let act of model.acts) {
    //       for (let item of ['actor', 'object', 'interested-party']) {
    //         if (typeof act[item] !== 'undefined') {
    //           validateAtomicFact(act[item], 'act/' + item, act.act)
    //         }
    //       }
    
    //       if (typeof act.create === 'string' && act.create !== '') {
    //         // Check if facts being referred are <<>>
    //         errors.push.apply(errors, validateCreateTerminate(act.create, 'act/create', act.act))
    //       }
    
    //       if (typeof act.terminate === 'string' && act.terminate !== '') {
    //         errors.push.apply(errors, validateCreateTerminate(act.terminate, 'act/terminate', act.act))
    //       }
    
    //       if (typeof act.preconditions === 'string' && act.preconditions.trim() !== '') {
    //         validateExpression(act.preconditions, 'act/preconditions', act.act)
    //       }
    //     }
    
    //     for (let fact of model.facts) {
    //       // TODO: Check if fact function <<>> has referring act
    //       if (typeof fact.function === 'string' && fact.function !== '[]' && fact.function !== '<<>>') {
    //         validateExpression(fact.function, 'fact/function', fact.fact)
    //       }
    //     }
    
    //     return errors
    //   }


}