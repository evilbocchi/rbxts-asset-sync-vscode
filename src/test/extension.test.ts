import * as assert from 'assert';
import * as vscode from 'vscode';

describe('Extension Test Suite', () => {
    before(() => {
        vscode.window.showInformationMessage('Start all tests.');
    });

    it('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
});

describe('AssetHoverProvider', () => {
    let hoverProvider: any;
    let mockDocument: any;
    let mockPosition: any;
    let mockToken: any;

    beforeEach(() => {
        hoverProvider = new (require('../assetHoverProvider').AssetHoverProvider)();
        hoverProvider.assetMap = { 'assets/test.png': '123456' };
        hoverProvider.getWorkspaceRoot = () => __dirname;
    });

    it('returns hover for known asset', () => {
        mockDocument = {
            getWordRangeAtPosition: () => ({ start: {}, end: {} }),
            lineAt: () => ({ text: 'getAsset("assets/test.png")' })
        };
        mockPosition = { line: 0 };
        const hover = hoverProvider.provideHover(mockDocument, mockPosition, mockToken);
        assert.ok(hover && hover.contents[0].value.includes('rbxassetid://123456'));
    });

    it('returns undefined for unknown asset', () => {
        hoverProvider.assetMap = {};
        mockDocument = {
            getWordRangeAtPosition: () => ({ start: {}, end: {} }),
            lineAt: () => ({ text: 'getAsset("assets/unknown.png")' })
        };
        mockPosition = { line: 0 };
        const hover = hoverProvider.provideHover(mockDocument, mockPosition, mockToken);
        assert.strictEqual(hover, undefined);
    });
});

describe('AssetDefinitionProvider', () => {
    let defProvider: any;
    let mockDocument: any;
    let mockPosition: any;

    beforeEach(() => {
        defProvider = new (require('../assetHoverProvider').AssetDefinitionProvider)();
        defProvider.getWorkspaceRoot = () => __dirname;
        defProvider.assetMap = { 'assets/test.png': '123456' };
    });

    it('returns definition for known asset', () => {
        mockDocument = {
            getWordRangeAtPosition: () => ({ start: {}, end: {} }),
            lineAt: () => ({ text: 'getAsset("assets/test.png")' })
        };
        mockPosition = { line: 0 };
        const loc = defProvider.provideDefinition(mockDocument, mockPosition);
        assert.ok(loc);
    });

    it('returns undefined for unknown asset', () => {
        defProvider.assetMap = {};
        mockDocument = {
            getWordRangeAtPosition: () => ({ start: {}, end: {} }),
            lineAt: () => ({ text: 'getAsset("assets/unknown.png")' })
        };
        mockPosition = { line: 0 };
        const loc = defProvider.provideDefinition(mockDocument, mockPosition);
        assert.strictEqual(loc, undefined);
    });
});

describe('Preview Audio Command', () => {
    it('registers and opens a webview', async () => {
        const vscode = require('vscode');
        let called = false;
        const fakePanel = { webview: { asWebviewUri: () => 'uri', html: '' } };
        vscode.window.createWebviewPanel = () => { called = true; return fakePanel; };
        const ext = require('../extension');
        await vscode.commands.executeCommand('rbxAssetSync.previewAudio', 'file:///test.mp3');
        assert.ok(called);
    });
});