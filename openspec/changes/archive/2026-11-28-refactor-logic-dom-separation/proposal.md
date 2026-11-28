# Proposal

## Why

`AGENTS.md` では `src/logic.ts` について「純粋関数のみを配置し DOM 依存を置かない方針」と定めているが、`eslint.config.mjs` では `import-x/no-restricted-paths` によるモジュール間の import 制限のみを行っており、グローバルの DOM API 参照までは禁止されていない（関連 Issue: #286）。

その結果、`src/logic.ts` 内に `cleanupDOM`、`fitImagesToViewport`（`applyRowLayout` 含む）、`revertToOriginal`、`getClickNavigationDirection`、`waitForImageLoad`、`forceImageLoad`、`preloadImages` などの DOM 操作関数および `window` / `document` / `HTMLElement` 等への直接依存が残存している。また、`eslint.config.mjs` では 4 ファイル（`src/logic.ts`, `src/ui/utils.ts`, `src/adapters/DefaultAdapter.ts`, `src/managers/Navigator.ts`）に対して `@typescript-eslint/no-unnecessary-condition` がファイル単位で無効化されており、型安全チェックの抜け道になっている。

## What Changes

- `src/logic.ts` に残存する DOM 操作関数（`cleanupDOM`, `fitImagesToViewport`, `revertToOriginal`, `getClickNavigationDirection`, `waitForImageLoad`, `forceImageLoad`, `preloadImages`, `getImageElementByIndex`）を新設する DOM ヘルパー層 `src/dom.ts` へ分離する。
- `src/logic.ts` に残す純粋関数（`getPrimaryVisibleImageIndex`, `getNavigationDirection`, `normalizeUrl`）から `HTMLImageElement`・`WheelEvent`・`window` への直接依存を除去し、プレーンな引数インターフェースおよびオプショナル引数 `baseOrigin` を受け取る純粋関数へリファクタリングする。
- `eslint.config.mjs` に `src/logic.ts` 向けの `no-restricted-globals` および `no-restricted-syntax`（DOM 型参照禁止）を追加し、DOM 非依存を機械的に強制する。また、`src/dom.ts` のレイヤー依存ルールを `import-x/no-restricted-paths` に追加する。
- `eslint.config.mjs` の 4 ファイルに対する `@typescript-eslint/no-unnecessary-condition` ファイル単位無効化を解消し、該当箇所の冗長な条件式・型を整理する。
- テスト（`src/logic.test.ts`, `src/logic.safety.test.ts`, `src/dom.test.ts` 等）を分離後の構成に合わせて再編し、`src/logic.ts` のカバレッジ 100% を維持するとともに `src/dom.ts` のテストカバレッジを確保する。

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `layered-architecture-enforcement`: `src/logic.ts` におけるブラウザ/DOM グローバル変数および DOM 型の直接参照を ESLint で禁止すること、および DOM ヘルパー層（`src/dom.ts`）のレイヤー境界を要件に追加する。
- `linting`: `@typescript-eslint/no-unnecessary-condition` を特定のファイル単位で例外的に無効化せず、プロジェクト全体で厳格に適用することを要件に追加する。

## Impact

- `src/logic.ts`, `src/dom.ts`（新規追加）
- `src/store.ts`, `src/managers/Navigator.ts`, `src/managers/InputManager.ts`, `src/managers/UIManager.ts`
- `src/adapters/DefaultAdapter.ts`, `src/ui/utils.ts`
- `eslint.config.mjs`
- `src/logic.test.ts`, `src/logic.safety.test.ts`, `src/dom.test.ts`（新規追加）, `src/managers/Navigator.test.ts`, `src/managers/InputManager.test.ts`
- `AGENTS.md`（#286 完了に伴う `src/logic.ts` 注記の更新）
