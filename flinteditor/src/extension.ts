// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { FlintNodeProvider as FlintNodeProvider } from './flintNodeProvider';
import { FlintDefinitionProvider } from './flintDefinitionProvider';
import { JsonInfo } from './jsonInfo';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const jsonInfo = new JsonInfo();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "flinteditor" is now active!');

	console.log("registering tree data providers");
	vscode.window.registerTreeDataProvider('flintActTree', new FlintNodeProvider(jsonInfo, 'acts'));
	vscode.window.registerTreeDataProvider('flintFactTree', new FlintNodeProvider(jsonInfo, 'facts'));
	vscode.window.registerTreeDataProvider('flintDutyTree', new FlintNodeProvider(jsonInfo, 'duties'));

	console.log("registering defintion provider");
	vscode.languages.registerDefinitionProvider({ language: 'json' , scheme: 'file'}, new FlintDefinitionProvider(jsonInfo));

	vscode.commands.registerCommand('extension.navToLine', line => vscode.commands.executeCommand('revealLine', {lineNumber: line, at: 'top'}));
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');

		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
