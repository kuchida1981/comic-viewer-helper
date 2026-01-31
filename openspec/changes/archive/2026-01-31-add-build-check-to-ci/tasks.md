## 1. ワークフローの作成

- [x] 1.1 新しいGitHub Actionsワークフローファイル `.github/workflows/build.yml` を作成する
- [x] 1.2 `build.yml` に `pull_request` 時のトリガーを設定する

## 2. ビルドステップの実装

- [x] 2.1 `build.yml` に `checkout` および `setup-node` アクションを設定する
- [x] 2.2 `npm ci` による依存関係のインストールステップを追加する
- [x] 2.3 `npm run build` によるビルド実行ステップを追加する

## 3. 検証

- [ ] 3.1 変更をプッシュし、GitHub上でビルドチェックが正常に実行・完了することを確認する
