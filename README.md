# Magazine Comic Viewer Helper

[![Stable Build](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml/badge.svg?branch=stable)](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml)
[![Unstable Build](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml/badge.svg?branch=unstable)](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml)

A browser extension (UserScript) that enhances the reading experience on specific magazine/fanzine comic sites.

## Installation

1. Install a UserScript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. Click the link below to install the script:
   - **[Stable Version (Recommended)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/stable/comic-viewer-helper.user.js)**
   - **[Unstable Version (Latest Development)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/unstable/comic-viewer-helper.user.js)**


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
Note: The `dist/` directory is excluded from the repository. The build artifacts are automatically deployed to the `release` branch by GitHub Actions upon merging to the master branch.

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
