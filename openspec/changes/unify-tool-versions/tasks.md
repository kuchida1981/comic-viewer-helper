# Tasks

## 1. OpenSpec CLI バージョンと Makefile の統一

- [x] 1.1 `package.json` の `@fission-ai/openspec` を `^2.1.1` に更新して `npm install` を実行し、`npx openspec --version` が 2.1.1 系になることを確認する
- [x] 1.2 `Makefile` の `docs` ターゲットを `npx openspec validate --strict --all` に変更し、`make docs` がローカル依存の `npx openspec` 経由で成功することを確認する

## 2. Node.js バージョンの固定と CI ワークフローの統一

- [x] 2.1 リポジトリルートに `.nvmrc`（内容: `22`）を作成し、`package.json` に `"engines": { "node": ">=22.20.0" }` を追加する
- [x] 2.2 `.github/workflows/` 配下の全ワークフロー（`build.yml`, `check-openspec.yml`, `deploy.yml`, `lint.yml`, `test.yml`）の `actions/setup-node@v4` で `node-version: '20'` を `node-version-file: '.nvmrc'` に置き換える

## 3. 全体検証

- [x] 3.1 `make all`（`npm run test`, `npm run lint`, `npm run check-types`, `npx openspec validate --strict --all`, `npm run build`）を実行し、すべてのチェックがエラーなしで完了することを確認する
