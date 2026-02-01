## 1. ビルドプロセスの刷新

- [x] 1.1 `scripts/build.mjs` を作成し、`package.json` からのバージョン取得と `header.js` の動的置換ロジックを実装する
- [x] 1.2 `package.json` の `build` スクリプトを `node scripts/build.mjs` に更新する
- [x] 1.3 `vite.config.mjs` に `define` 設定を追加し、`__APP_VERSION__` と `__IS_UNSTABLE__` を注入可能にする

## 2. UI 表示の改善

- [x] 2.1 `src/ui/components/MetadataModal.js` （または適切な場所）を修正し、バージョンとリリースタイプを表示するロジックを追加する
- [x] 2.2 多言語辞書 (`src/i18n.js`) にリリースタイプ表示用の文言（Stable/Unstable）を追加する
- [x] 2.3 `npm test` を実行し、UIコンポーネントのテストが正常にパスすることを確認する

## 3. GitHub Actions (CI/CD) の修正

- [ ] 3.1 `.github/workflows/deploy.yml` を更新し、`master` プッシュ時とタグプッシュ時の条件分岐を実装する
- [ ] 3.2 タグプッシュ時に GitHub Release を自動作成し、成果物を添付するステップを追加する
- [ ] 3.3 `master` プッシュ時に `IS_UNSTABLE=true` を環境変数としてビルドスクリプトに渡す設定を追加する

## 4. ドキュメントと移行作業

- [ ] 4.1 `README.md` のインストールリンクを `stable` と `unstable` ブランチを指すように更新する
- [ ] 4.2 `README.md` に各ブランチのビルド状況を示すステータスバッジを追加する
- [ ] 4.3 既存の `release` ブランチを一度だけ更新し、メタデータの `@updateURL` 等を `stable` に向ける移行措置を講じる
- [ ] 4.4 開発ドキュメント（あれば）に新しいリリースフローの手順を追記する
