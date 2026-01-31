## 1. 開発環境のセットアップ

- [ ] 1.1 `devDependencies` の追加 (`@vitest/coverage-v8`, `typescript`, `eslint-plugin-userscripts`, `@types/greasemonkey`)
- [ ] 1.2 `vitest.config.mjs` にカバレッジ計測の設定を追加
- [ ] 1.3 `eslint.config.mjs` に `eslint-plugin-userscripts` の設定を追加
- [ ] 1.4 `package.json` に `check-types` スクリプトを追加

## 2. コードへの型定義の追加

- [ ] 2.1 `src/logic.js` の主要関数に JSDoc アノテーションを付与
- [ ] 2.2 型チェック (`npm run check-types`) を実行し、指摘事項を修正
- [ ] 2.3 UserScript ヘッダー (`src/header.js`, `src/main.js`) の Lint チェックをパスさせる

## 3. テストの強化と可視化

- [ ] 3.1 カバレッジレポート (`npm test -- --coverage`) を生成し、未カバーのパスを確認
- [ ] 3.2 必要に応じて `src/logic.test.js` にテストケースを追加し、カバレッジを向上させる

## 4. CI パイプラインへの統合

- [ ] 4.1 `.github/workflows/test.yml` 等を更新し、型チェックとカバレッジ計測を組み込む
- [ ] 4.2 GitHub Actions 上で全ジョブがパスすることを確認
