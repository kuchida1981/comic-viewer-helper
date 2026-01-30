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
2.  Install the script by copying the content of `comic-viewer-helper.user.js` in this repository or by opening the Raw file link.
3.  The script will be automatically enabled when you visit supported sites.

## Usage

The following operations are available on pages where the script is active.

### Keyboard Shortcuts

| Action | Key |
| :--- | :--- |
| **Next Image** | `↓` `→` `PageDown` `Space` `j` |
| **Previous Image** | `↑` `←` `PageUp` `Shift + Space` `k` |

### On-screen UI

You can use the panel at the bottom right of the screen. **The panel is draggable**; you can move it to any position by dragging with your mouse.

*   **Page Counter**: Displays "Current Image / Total Images".
*   **Toggle Spread**: Enable/disable dual page (spread) view (can also be toggled with `d` key).
*   **<<**: Go to the first image.
*   **<**: Go to the previous image.
*   **>**: Go to the next image.
*   **>>**: Go to the last image.

## Supported Sites

*   `https://something/magazine/*`
*   `https://something/fanzine/*`

*Note: You can modify the target domains in the `@match` section of the script.*

## Technical Specifications

*   Target Container Selector: `#post-comic`
*   Target Image Selector: `#post-comic img`

## Development

### ⚠️ Important: Do Not Edit `.user.js` Directly
The `comic-viewer-helper.user.js` file at the root is a **build artifact**. Do not edit it manually.
Please modify files in the `src/` directory and run the build command.

### Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```

### Build
To generate the `comic-viewer-helper.user.js` file from source:
```bash
npm run build
```

### Test
To run unit tests using Vitest:
```bash
npm test
```

## Disclaimer

This script was created for personal learning and convenience purposes.
It may stop working due to changes in the specifications of the target sites.
