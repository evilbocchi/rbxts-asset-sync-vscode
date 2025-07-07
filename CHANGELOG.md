# Change Log

## [1.1.1] - 2025-07-07

### Changed

- Refactored asset hover provider to use async fs API for improved performance and reliability.

## [1.1.0] - 2025-07-06

### Improved

- Asset hover now resolves by filename, making asset detection more robust.

## [1.0.0] - 2025-07-06

### Added

- Hover previews for `getAsset("...")` calls, showing Roblox asset IDs, quick links, and inline previews for images/audio.
- "Go to Definition" support for asset paths, jumping to the corresponding asset file.
- Audio preview command and webview for `.mp3`, `.ogg`, and `.wav` assets.
- Support for asset maps defined in `assetMap.ts`.
- No custom extension settings required.