import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export class AssetHoverProvider implements vscode.HoverProvider {
    private assetMap: Record<string, string> = {};
    private filenameToPaths: Record<string, string[]> = {};
    private watcher?: vscode.FileSystemWatcher;

    constructor() {
        this.loadAssetMap();
        this.watchAssetMap();
    }

    getWorkspaceRoot(): string {
        return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    }

    private findAssetMapPath(): string | undefined {
        const root = this.getWorkspaceRoot();
        if (!root) {
            return;
        }

        const full = path.resolve(root, 'assetMap.ts');
        if (fs.existsSync(full)) {
            return full;
        }

        // fallback: search project recursively
        const allFiles = fs.readdirSync(root, { withFileTypes: true });
        const stack = allFiles.map((f) => path.join(root, f.name));
        while (stack.length) {
            const current = stack.pop();
            if (!current) {
                continue;
            }
            if (current.endsWith('.ts') && fs.readFileSync(current, 'utf8').includes('rbxassetid://')) {
                return current;
            }
            if (fs.statSync(current).isDirectory()) {
                const children = fs.readdirSync(current).map((c) => path.join(current, c));
                stack.push(...children);
            }
        }
        return;
    }

    private loadAssetMap() {
        this.assetMap = {};
        this.filenameToPaths = {};
        const mapPath = this.findAssetMapPath();
        if (!mapPath) {
            return;
        }

        if (fs.existsSync(mapPath)) {
            const raw = fs.readFileSync(mapPath, 'utf8');
            const matches = [...raw.matchAll(/"([^"]+)": \"rbxassetid:\/\/(\d+)\"/g)];
            for (const [, assetPath, id] of matches) {
                this.assetMap[assetPath] = id;
                const filename = assetPath.split('/').pop() || assetPath;
                if (!this.filenameToPaths[filename]) {
                    this.filenameToPaths[filename] = [];
                }
                this.filenameToPaths[filename].push(assetPath);
            }
        }
    }

    private watchAssetMap() {
        const watcher = vscode.workspace.createFileSystemWatcher('**/*AssetMap.ts');

        watcher.onDidChange(() => this.loadAssetMap());
        watcher.onDidCreate(() => this.loadAssetMap());
        watcher.onDidDelete(() => this.assetMap = {});

        this.watcher = watcher;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {

        const range = document.getWordRangeAtPosition(position, /\"([^\"]+)\"/);
        if (!range) {
            return;
        }

        // Match any function call with a string argument (any prefix)
        const line = document.lineAt(position.line).text;
        const match = line.match(/([a-zA-Z0-9_]+)\("([^"]+)"\)/);
        if (!match) {
            return;
        }

        const assetPathOrFilename = match[2];
        let assetId = this.assetMap[assetPathOrFilename];
        let resolvedAssetPath = assetPathOrFilename;

        // If not found, try to find a unique asset path that ends with the filename using the index
        if (!assetId) {
            const filename = assetPathOrFilename.split('/').pop() || assetPathOrFilename;
            const possiblePaths = this.filenameToPaths[filename] || [];
            if (possiblePaths.length === 1) {
                resolvedAssetPath = possiblePaths[0];
                assetId = this.assetMap[resolvedAssetPath];
            } else {
                return;
            }
        }

        const fullPath = path.resolve(this.getWorkspaceRoot(), resolvedAssetPath);
        const uri = vscode.Uri.file(fullPath);
        const ext = path.extname(resolvedAssetPath).toLowerCase();

        const hoverText = new vscode.MarkdownString();
        hoverText.appendMarkdown(`rbxassetid://${assetId}\n\n`);
        hoverText.appendMarkdown(`[📂 Open \`${resolvedAssetPath}\`](command:vscode.open?${encodeURIComponent(JSON.stringify(uri.toString()))})\n\n`);

        if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(ext)) {
            const imageUri = uri.with({ scheme: 'vscode-resource' });
            hoverText.appendMarkdown(`![preview](${imageUri.path})\n`);
        } else if ([".mp3", ".ogg", ".wav"].includes(ext)) {
            const commandUri = vscode.Uri.parse(`command:rbxAssetSync.previewAudio?${encodeURIComponent(JSON.stringify(uri.toString()))}`);
            hoverText.appendMarkdown(`[▶️ Preview Audio](${commandUri})`);
        }

        hoverText.isTrusted = true;
        return new vscode.Hover(hoverText, range);
    }
}

export class AssetDefinitionProvider implements vscode.DefinitionProvider {
    provideDefinition(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Location> {
        const range = document.getWordRangeAtPosition(position, /"([^\"]+)"/);
        if (!range) {
            return;
        }
        const text = document.getText(range);
        const assetPath = text.replace(/['"\\]/g, '');
        const fullPath = path.resolve(vscode.workspace.rootPath || '', assetPath);
        if (fs.existsSync(fullPath)) {
            return new vscode.Location(vscode.Uri.file(fullPath), new vscode.Position(0, 0));
        }
        return;
    }
}