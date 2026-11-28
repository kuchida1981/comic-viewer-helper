# Proposal

## Why

Lint やテストなどの機械検証の対象外となっているドキュメント（`README.md`, `README.ja.md`）および一部の OpenSpec 仕様書（`openspec/specs/reliability-verification/spec.md`）に、現行実装・ワークフローとの乖離（陳腐化）が発生している（関連 Issue: #287）。

## What Changes

- `README.ja.md` のキーボードショートカット表を `src/shortcuts.ts`（`NAV_ARROW_KEYS`）の実装・右開き漫画規約に合わせて「次の画像へ: `←`」「前の画像へ: `→`」へ修正する。
- `README.ja.md` / `README.md` から TypeScript 移行前の古い記述（`src/logic.js`、`JSDoc と TypeScript`）、`release` ブランチ表記（現行は `master` → `unstable`、バージョンタグ → `stable`）、および `npx` なしの `openspec validate` 表記を現行に合わせて修正する。
- `openspec/specs/reliability-verification/spec.md` のカバレッジ出力先（`dist/coverage` → `coverage`）および型チェックの前提（`JSDoc` → TypeScript の厳格な型定義）を現行設定・実装に合わせて更新する。

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `reliability-verification`: テストカバレッジの出力先ディレクトリおよび静的型チェックの記述を現行の Vitest / TypeScript 構成に合わせて更新する。

## Impact

- `README.ja.md`
- `README.md`
- `openspec/specs/reliability-verification/spec.md`（デルタマージ後）
