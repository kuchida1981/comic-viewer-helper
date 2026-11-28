# Tasks

## 1. README ドキュメントの更新

- [x] 1.1 `README.ja.md` のキーボードショートカット表（次の画像へ: `←`、前の画像へ: `→`）を `src/shortcuts.ts` の実装に合わせて修正する
- [x] 1.2 `README.ja.md` と `README.md` の `src/logic.js` 表記を `src/logic.ts` に、「JSDoc と TypeScript」を TypeScript の記述に、`openspec validate` を `npx openspec validate` に更新する
- [x] 1.3 `README.md` の自動デプロイ先表記（`release` branch）を `.github/workflows/deploy.yml` に合わせて `unstable` / `stable` ブランチへ修正する

## 2. 検証

- [x] 2.1 `README.md` / `README.ja.md` / `openspec/specs/` に `src/logic.js` や `dist/coverage` などの古い表記が残っていないことを `grep` で確認する
- [x] 2.2 `make all`（`test`, `lint`, `typecheck`, `docs`, `build`）を実行し、すべてのチェックがエラーなしで完了することを確認する
