import * as vscode from 'vscode';
import { AssetDefinitionProvider, AssetHoverProvider } from './assetHoverProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('rbx-asset-sync-vscode activated');

    // Register hover provider for .ts and .tsx files
    const assetHover = vscode.languages.registerHoverProvider(
        [{ language: 'typescript', scheme: 'file' }, { language: 'typescriptreact', scheme: 'file' }],
        new AssetHoverProvider()
    );

    const definitionProvider = vscode.languages.registerDefinitionProvider(
        [{ language: 'typescript', scheme: 'file' }, { language: 'typescriptreact', scheme: 'file' }],
        new AssetDefinitionProvider()
    );

    const previewCommand = vscode.commands.registerCommand('rbxAssetSync.previewAudio', async (fileUri: string) => {
        const decodedPath = decodeURIComponent(fileUri.replace('file://', ''));
        const panel = vscode.window.createWebviewPanel(
            'audioPreview',
            'Audio Preview',
            vscode.ViewColumn.Beside,
            { enableScripts: true, localResourceRoots: [vscode.Uri.file(vscode.workspace.rootPath || '')] }
        );

        const webviewUri = panel.webview.asWebviewUri(vscode.Uri.file(decodedPath));

        const html = `<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/wavesurfer.js"></script>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    #waveform { width: 100%; height: 128px; margin-bottom: 10px; }
    button { font-size: 1rem; padding: 4px 12px; }
  </style>
</head>
<body>
  <h2>Audio Preview</h2>
  <div id="waveform"></div>
  <button onclick="wavesurfer.playPause()">▶️ Play / Pause</button>

  <script>
    const wavesurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#ccc',
      progressColor: '#007acc',
      height: 96,
      responsive: true
    });
    wavesurfer.load('${webviewUri}');
  </script>
</body>
</html>`;

        panel.webview.html = html;
    });



    context.subscriptions.push(assetHover, previewCommand);
    context.subscriptions.push(definitionProvider);
}

export function deactivate() { }