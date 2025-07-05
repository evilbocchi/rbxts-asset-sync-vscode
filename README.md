# rbxts-asset-sync-vscode

VS Code extension for seamless integration with [rbxts-asset-sync](https://github.com/evilbocchi/rbxts-asset-sync) projects. This extension provides hover previews, asset navigation, and audio preview commands for Roblox asset references in TypeScript projects.

## Features

- **Hover Previews:**  
  Hover over `getAsset("assets/yourAsset.ext")` calls to see Roblox asset IDs, quick links to open the asset, and inline previews for images and audio.

- **Go to Definition:**  
  Ctrl+Click or F12 on asset paths to jump directly to the corresponding asset file in your workspace.

- **Audio Preview:**  
  Use the "Preview Audio" command or click the preview link in hovers to open a webview with an interactive audio player for `.mp3`, `.ogg`, or `.wav` assets.

## Usage

1. Open a project containing an `assetMap.ts` file mapping asset paths to Roblox asset IDs.
2. Hover over `getAsset("assets/yourAsset.ext")` in your TypeScript code to see asset info and previews.
3. Click the 📂 link to open the asset file, or ▶️ to preview audio assets.
4. Use "Go to Definition" on asset paths to jump to the file.

## Requirements

- VS Code 1.101.0 or newer
- A workspace with an `assetMap.ts` file mapping asset paths to Roblox asset IDs

## Extension Settings

This extension does not add any custom settings.

## Development

- Clone the repo and run `npm install`
- Use `npm run watch` to build the extension in watch mode
- Press `F5` in VS Code to launch a new Extension Development Host
- Tests are in `src/test/extension.test.ts` and can be run with the provided tasks

## Known Issues

- Only supports asset maps in TypeScript format (`assetMap.ts`)
- Asset previews are limited to common image and audio formats

## License

MIT