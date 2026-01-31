# Magazine Comic Viewer Helper

A Tampermonkey/Greasemonkey user script for specific comic sites.
It automatically fits images to the browser viewport and enables comfortable image-by-image scrolling.

[日本語のREADMEはこちら](./README.ja.md)

## Features

*   **Fit Images to Viewport**: Automatically resizes images to fit the window width and height.
*   **Image-by-Image Scrolling**: Smoothly scroll through images one by one using the keyboard or on-screen buttons.
*   **Navigation UI**: Displays the current page number (image index) and navigation buttons at the bottom right of the screen.
*   **Keyboard Shortcuts**: Easy operation using arrow keys or the space bar.

## Installation

1.  Install a user script manager extension like [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2.  Install the script by copying the content of `dist/comic-viewer-helper.user.js` in this repository or by opening the Raw file link.
3.  The script will be automatically enabled when you visit supported sites.

...

## Development

### ⚠️ Important: Do Not Edit Built Files Directly
The `dist/comic-viewer-helper.user.js` file is a **build artifact**. Do not edit it manually.
Please modify files in the `src/` directory and run the build command.

### Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```

### Build
To generate the `dist/comic-viewer-helper.user.js` file from source:
```bash
npm run build
```
**Important**: After running the build, ensure you commit and push the updated `dist/comic-viewer-helper.user.js` as it is the primary distribution file.

### Test
To run unit tests using Vitest (includes coverage report):
```bash
npm test
```
Core logic (`src/logic.js`) is maintained with **100% code coverage**.

### Type Check
To run static type analysis using JSDoc and TypeScript:
```bash
npm run check-types
```

### Lint
To run ESLint (includes UserScript metadata validation):
```bash
npm run lint
```

## Disclaimer

This script was created for personal learning and convenience purposes.
It may stop working due to changes in the specifications of the target sites.
