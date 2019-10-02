// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { FlintNodeProvider as FlintNodeProvider } from './flintNodeProvider';
import { FlintDefinitionProvider } from './flintDefinitionProvider';
import { JsonInfo } from './jsonInfo';
import { FlintReferenceProvider } from './flintReferenceProvider';
import { FlintDiagnosticManager } from './flintDiagnosticManager';

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
	vscode.languages.registerReferenceProvider({ language: 'json' , scheme: 'file'}, new FlintReferenceProvider(jsonInfo));

	const collection = vscode.languages.createDiagnosticCollection('Flint');
	const manager = new FlintDiagnosticManager(collection, jsonInfo);

	vscode.commands.registerCommand('extension.navToLine', line => vscode.commands.executeCommand('revealLine', {lineNumber: line, at: 'top'}));
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');

		
	});

	context.subscriptions.push(vscode.commands.registerCommand('extension.run', () => {
		ReactPanel.createOrShow(context.extensionPath, jsonInfo);
	}));

	context.subscriptions.push(disposable);
}

/**
 * Manages react webview panels
 */
class ReactPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: ReactPanel | undefined;

	private static readonly viewType = 'react';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionPath: string, jsonInfo: JsonInfo) {
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		// If we already have a panel, show it.
		// Otherwise, create a new panel.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.reveal(column);
		} else {
			console.log("Creating new panel");
			ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.One, jsonInfo.raw);
		}
	}

	private constructor(extensionPath: string, column: vscode.ViewColumn, model: string) {
		this._extensionPath = extensionPath;

		console.log("Creating new webview");
		// Create and show a new webview panel
		this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "React", column, {
			// Enable javascript in the webview
			enableScripts: true,

			// And restric the webview to only loading content from our extension's `build` directory.
			localResourceRoots: [
				vscode.Uri.file(path.join(this._extensionPath, 'build'))
			]
		});
		
		console.log("Setting html content");
		// Set the webview's initial html content 
		this._panel.webview.html = this._getHtmlForWebview(model);

		console.log("Listening for dispose");
		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		console.log("Handle messages");
		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
			}
		}, null, this._disposables);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		ReactPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview(model: string) {
		console.log("Finding manifest");
		const manifest = require(path.join(this._extensionPath, 'build', 'asset-manifest.json'));
		console.log(manifest);
		const mainScript = manifest['files']['main.js'];
		const mainStyle = manifest['files']['main.css'];

		console.log("Building paths");
		console.log(this._extensionPath, mainScript);
		const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'build', mainScript));
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
		console.log("Building style path");
		const stylePathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'build', mainStyle));
		const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });

		console.log("Getting nonce");
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
				<meta name="theme-color" content="#000000">
				<title>Flint</title>
				<link rel="stylesheet" type="text/css" href="${styleUri}">
				<!--<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';style-src vscode-resource: 'unsafe-inline' http: https: data:;">
				-->
				<base href="${vscode.Uri.file(path.join(this._extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">
			</head>
			<body>
				<noscript>You need to enable JavaScript to run this app.</noscript>
				<div id="root"></div>
				<script>window.model = ${model};</script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

// this method is called when your extension is deactivated
export function deactivate() {}
