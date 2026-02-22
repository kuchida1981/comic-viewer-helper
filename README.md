# Magazine Comic Viewer Helper

[![Build Status](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml)

A browser extension (UserScript) that enhances the reading experience on specific magazine/fanzine comic sites.

## Installation

1. Install a UserScript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. Click the link below to install the script:
   - **[Stable Version (Recommended)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/stable/comic-viewer-helper.user.js)**
   - **[Unstable Version (Latest Development)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/unstable/comic-viewer-helper.user.js)**


## Key Features

- **Resume Reading Position**: Automatically saves your last read page and offers to resume when you revisit the same URL.
- **Spread View**: View two pages at once for a better reading experience.
- **Progress Bar**: Visual progress tracking.
- **Keyboard Navigation**: Fast and easy navigation using keyboard shortcuts.
- **Dual Mode Support**: Seamlessly switch between single page and spread views.

## Development

### ⚠️ Important: Do Not Edit Built Files Directly
The `dist/comic-viewer-helper.user.js` file is a **build artifact**. Do not edit it manually.
Please modify files in the `src/` directory and run the build command.

### Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
   Note: Git hooks (husky) are automatically set up during `npm install`.
   If you need to manually set up husky, run the following command:
   ```bash
   npx husky
   ```

### Development Workflow

This project uses Git hooks (husky) to automatically perform quality checks before each commit.

When you run `git commit`, the following checks are automatically executed:
1. `npm run lint` - ESLint checks
2. `npm run check-types` - TypeScript type checking
3. `npm test` - Unit tests (100% coverage required for core logic)
4. `npm run build` - Build verification
5. `openspec validate --strict --all` - Specification validation

If any of these checks fail, the commit will be blocked.

To manually run all quality checks before creating a pull request:

```bash
make all
# or
make pre-pr
```

This runs:
1. `npm test` - Unit tests (100% coverage required for core logic)
2. `npm run lint` - ESLint checks
3. `npm run check-types` - TypeScript type checking
4. `openspec validate --strict --all` - Specification validation
5. `IS_UNSTABLE=true npm run build` - Build verification

**All checks must pass** before creating a PR.

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

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
