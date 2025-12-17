// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const gifFrames = require('gif-frames');

let currentFrame = 0;
let frameDataUrls: string[] = [];
let totalFrames = 0;
let vibeCatProvider: VibeCatViewProvider;

class VibeCatViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionUri: vscode.Uri) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		this.updateWebview();
	}

	public updateWebview() {
		if (this._view) {
			this._view.webview.html = this._getHtmlForWebview();
		}
	}

	private _getHtmlForWebview() {
		if (totalFrames === 0 || frameDataUrls.length === 0) {
			return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>VibeCat</title>
			</head>
			<body>
				<p>Loading VibeCat...</p>
			</body>
			</html>`;
		}

		const frameUrl = frameDataUrls[currentFrame];
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>VibeCat</title>
			<style>
				body {
					padding: 0;
					margin: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					height: 100vh;
				}
				img {
					max-width: 100%;
					height: auto;
					image-rendering: pixelated;
				}
			</style>
		</head>
		<body>
			<img src="${frameUrl}" alt="VibeCat Frame ${currentFrame + 1}" />
		</body>
		</html>`;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('VibeCat extension is now active!');

	// Create the webview provider
	vibeCatProvider = new VibeCatViewProvider(context.extensionUri);

	// Register the webview view provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('vibeCatView', vibeCatProvider)
	);

	// Load GIF frames
	await loadGifFrames(context);

	// Update webview with first frame
	vibeCatProvider.updateWebview();

	// Reload GIF when settings change
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(async (e) => {
			if (e.affectsConfiguration('vibecat.customGifPath')) {
				// Reset frame data
				currentFrame = 0;
				frameDataUrls = [];
				totalFrames = 0;
				// Reload frames
				await loadGifFrames(context);
				vibeCatProvider.updateWebview();
			}
		})
	);

	// Listen to keyboard events
	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(() => {
			// This event fires on keyboard input (cursor movement)
			advanceFrame();
		})
	);

	// Also listen to text document changes for typing
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(() => {
			advanceFrame();
		})
	);
}

async function loadGifFrames(context: vscode.ExtensionContext) {
	try {
		// Get custom GIF path from settings
		const config = vscode.workspace.getConfiguration('vibecat');
		const customGifPath = config.get<string>('customGifPath');
		
		let gifPath: string;
		if (customGifPath && customGifPath.trim() !== '') {
			// Use custom GIF path
			gifPath = customGifPath;
			if (!path.isAbsolute(gifPath)) {
				// If relative path, resolve it relative to workspace
				const workspaceFolders = vscode.workspace.workspaceFolders;
				if (workspaceFolders && workspaceFolders.length > 0) {
					gifPath = path.join(workspaceFolders[0].uri.fsPath, gifPath);
				}
			}
		} else {
			// Use default GIF
			gifPath = path.join(context.extensionPath, 'assets', 'vibecat.gif');
		}
		
		if (!fs.existsSync(gifPath)) {
			vscode.window.showErrorMessage(`GIF file not found: ${gifPath}`);
			return;
		}

		// Extract frames from GIF
		const frameData = await gifFrames({ 
			url: gifPath, 
			frames: 'all',
			outputType: 'png'
		});

		totalFrames = frameData.length;
		
		// Convert frames to data URLs for webview display
		for (let i = 0; i < frameData.length; i++) {
			const frame = frameData[i];
			const stream = frame.getImage();
			const chunks: Buffer[] = [];
			
			await new Promise<void>((resolve, reject) => {
				stream.on('data', (chunk: Buffer) => chunks.push(chunk));
				stream.on('end', () => resolve());
				stream.on('error', reject);
			});

			const buffer = Buffer.concat(chunks);
			const base64 = buffer.toString('base64');
			frameDataUrls.push(`data:image/png;base64,${base64}`);
		}

		console.log(`Loaded ${totalFrames} frames from GIF`);
	} catch (error) {
		console.error('Error loading GIF frames:', error);
		vscode.window.showErrorMessage('Failed to load GIF frames');
	}
}

function advanceFrame() {
	if (totalFrames === 0) {
		return;
	}
	
	currentFrame = (currentFrame + 1) % totalFrames;
	vibeCatProvider.updateWebview();
}

// This method is called when your extension is deactivated
export function deactivate() {}
