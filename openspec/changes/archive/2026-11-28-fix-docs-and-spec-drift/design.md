# Design

## Context

確認された具体的な乖離箇所と動機については [proposal.md](./proposal.md) を参照。

## Goals / Non-Goals

**Goals:**
- `README.ja.md` と `README.md` の記述を現行実装（`src/shortcuts.ts`, `src/logic.ts`）および現行ワークフロー（`.github/workflows/deploy.yml`, `Makefile`, `.husky/pre-commit`）と一致させる。
- `openspec/specs/reliability-verification/spec.md` の記述を現行の Vitest / TypeScript 構成と一致させる。

**Non-Goals:**
- プロダクションコードや CI ワークフロー自体の変更。
- `README.md` / `README.ja.md` の構成全体の全面改稿（乖離箇所の修正に限定する）。

## Decisions

1. **デルタスペックで `reliability-verification` の 2 要件を `MODIFIED Requirements` として更新する**
   - *理由*: 既存の「テストカバレッジの自動計測」と「静的型チェックの実施」の要件自体は維持しつつ、シナリオの出力先（`dist/coverage` → `coverage`）と型チェック前提（`JSDoc` 削除）のみを現行実装に合わせるため。
