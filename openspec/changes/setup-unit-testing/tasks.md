## 1. 環境構築

- [x] 1.1 `vitest` を `devDependencies` に追加し、インストールする
- [x] 1.2 `package.json` に `test` スクリプト (`vitest run`) を追加する
- [x] 1.3 `vitest.config.mjs` を作成し、基本的な設定を行う

## 2. コードのモジュール化対応

- [x] 2.1 テスト対象のロジックを `comic-viewer-helper.user.js` から分離するか、エクスポート可能な形式に調整する
- [x] 2.2 テスト環境でグローバル変数（`unsafeWindow` 等）がエラーにならないよう、モック設定を追加する

## 3. ユニットテストの作成

- [x] 3.1 画像サイズ計算ロジック（`fitImageToViewport` 等）のテストを作成する
- [x] 3.2 ページ spread 計算ロジックのテストを作成する
- [x] 3.3 全てのテストがローカル環境でパスすることを確認する

## 4. CI 設定 (GitHub Actions)

- [x] 4.1 `.github/workflows/test.yml` を作成し、プッシュおよび PR 時の自動テスト実行を設定する
- [ ] 4.2 GitHub 上でアクションが正常に動作し、テスト結果が報告されることを確認する