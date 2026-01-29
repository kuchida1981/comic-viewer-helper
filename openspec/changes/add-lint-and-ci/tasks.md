## 1. 開発環境のセットアップ

- [x] 1.1 `npm init` を実行し、`package.json` を作成する
- [x] 1.2 `eslint` (v9+) および `globals` パッケージを開発依存としてインストールする
- [x] 1.3 `eslint.config.mjs` を作成し、フラット設定を用いて UserScript 用の設定（`browser` + `greasemonkey` globals）を記述する
- [x] 1.4 `package.json` に `lint` スクリプト（`eslint comic-viewer-helper.user.js`）を追加する

## 2. 既存コードの修正

- [x] 2.1 `npm run lint` を実行し、現状のエラーを確認する
- [x] 2.2 検出されたエラー（構文、未定義変数、スタイル違反など）を修正する
- [x] 2.3 必要に応じて、修正困難な箇所に対して一時的なルール無効化コメントを追加する（ただし最小限に留める）

## 3. GitHub Actions の設定

- [x] 3.1 `.github/workflows/lint.yml` を作成する
- [x] 3.2 ワークフローのトリガーを `pull_request` のみに設定する
- [x] 3.3 Node.js のセットアップ、依存関係インストール、`npm run lint` の実行ステップを定義する

## 4. 動作検証

- [x] 4.1 ローカルで `npm run lint` がパスすることを確認する
- [ ] 4.2 GitHub に変更をプッシュし、Pull Request を作成して CI が動作することを確認する（※自分自身のリポジトリでの検証）
