# Magazine Comic Viewer Helper

[![Build Status](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml)

A browser extension (UserScript) that enhances the reading experience on specific magazine/fanzine comic sites.

## Installation

1. Install a UserScript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. Click the link below to install the script:
   - **[Stable Version (Recommended)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/stable/comic-viewer-helper.user.js)**
   - **[Unstable Version (Latest Development)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/unstable/comic-viewer-helper.user.js)**
3. Navigate to a supported site — the script activates automatically.

## Key Features

- **Pick Up Where You Left Off (Resume)**: Automatically remembers your last page. When you reopen a title, it asks if you want to continue — no more hunting for your place.
- **Read Like a Real Magazine (Spread View)**: Toggle between single-page and spread view with a single key (`d`). Flip pages just like holding an actual magazine.
- **See Your Progress at a Glance (Progress Bar)**: A visual indicator shows how far you are through a volume — great for long series.
- **Never Take Your Hands Off the Keyboard (Navigation)**: Flip pages with `j` / `k`, arrow keys, or Space — keep your reading flow uninterrupted.
- **Always the Right Size (Responsive Fit)**: Images auto-adjust to your browser window. Looks great fullscreen or in a small window.

## Supported Sites

- `https://something/magazine/*`
- `https://something/fanzine/*`

> The target domain can be changed via the `@match` setting in the script.

## Usage

Once the script is active on a supported page, the following controls are available.

### Keyboard Shortcuts

| Action | Keys |
| :--- | :--- |
| **Next image** | `↓` `→` `PageDown` `Space` `j` |
| **Previous image** | `↑` `←` `PageUp` `Shift + Space` `k` |
| **Toggle spread view** | `d` |

### On-Screen Panel

A control panel appears in the bottom-right corner of the screen. **The panel is draggable** — move it anywhere with your mouse.

- **Page counter**: Shows current image position / total images
- **Spread**: Toggles between single-page and spread view (also via `d` key)
- **`<<`**: Jump to the first image
- **`<`**: Go to the previous image
- **`>`**: Go to the next image
- **`>>`**: Jump to the last image

## Development

### Architecture

The application uses a layered architecture with clear separation of concerns.

```
+------------------------------------------+
|                   App                    |
|         (Entry point / Lifecycle)        |
+----------+-------------------+-----------+
           |                   |
    +------+------+    +-------+------+
    |  Managers   |    |    Store     |
    | - Navigator |    | (Central     |
    | - UIManager |    |  state mgmt) |
    | - Resume... |    +--------------+
    +------+------+
           |
    +------+------+     +----------------+
    |  Adapters   |     |   logic.ts     |
    | (Site-spec. |     | (Pure funcs    |
    |  DOM abstr) |     |  No DOM deps)  |
    +------+------+     +----------------+
           |
        [DOM]
```

- **App**: Entry point. Initializes and coordinates all components.
- **Managers**: Feature-specific logic (Navigator, UIManager, ResumeManager, etc.).
- **Store**: Central application state management.
- **Adapters**: Abstracts site-specific DOM structures, decoupling Managers from site details.
- **logic.ts**: Pure functions only — no DOM dependencies. Easy to test; 100% coverage enforced.

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

### Design Philosophy / Engineering Excellence

This is a personal project, but it's held to professional quality standards.

#### Specification-Driven Development (OpenSpec)

Every feature, fix, and refactor follows the [OpenSpec](https://github.com/kuchida1981/openspec) workflow: define requirements → write scenarios → create tasks → implement. This keeps the *why* behind every code change traceable and documented.

#### 100% Test Coverage for Core Logic

`src/logic.ts` contains the application's core pure functions with zero DOM dependencies. Maintaining **100% code coverage** ensures safe refactoring and reliable logic at all times.

### Build
To generate the `dist/comic-viewer-helper.user.js` file from source:
```bash
npm run build
```
Note: The `dist/` directory is excluded from the repository. GitHub Actions automatically deploys build artifacts to the `unstable` branch on each push to `master`, and to the `stable` branch on version tag pushes.

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
