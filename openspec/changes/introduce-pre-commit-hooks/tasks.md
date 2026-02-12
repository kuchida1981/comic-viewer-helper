## 1. 依存関係のセットアップ

- [x] 1.1 `husky` を開発依存関係に追加する
- [x] 1.2 `package.json` に `prepare` スクリプト (`"prepare": "husky"`) を追加する
- [x] 1.3 `husky` の初期セットアップを実行する (`npm run prepare` または `npx husky`)

## 2. 設定ファイルの構成

- [x] 2.1 `.husky/pre-commit` フックファイルを作成し、検証フローを記述する
    - `npm run lint`
    - `npm run check-types`
    - `npm run test`
    - `npm run build`
    - `npx openspec validate --strict --all`
- [x] 2.2 `.husky/pre-commit` ファイルに実行権限を付与する

## 3. 動作検証

- [x] 3.1 Lint エラーがある状態でコミットを試行し、正しく阻止されることを確認する
- [x] 3.2 型エラーがある状態でコミットを試行し、正しく阻止されることを確認する
- [x] 3.3 テストが失敗する状態でコミットを試行し、正しく阻止されることを確認する
- [x] 3.4 すべてのチェックがパスする状態でコミットが成功することを確認する
