## 1. 実装

- [ ] 1.1 `scripts/build.mjs` を修正し、`isUnstable` フラグが有効な場合に `@updateURL` と `@downloadURL` の `/stable/` を `/unstable/` に置換するロジックを追加する

## 2. 検証

- [ ] 2.1 ローカル環境で `IS_UNSTABLE=true npm run build` を実行する
- [ ] 2.2 `dist/comic-viewer-helper.user.js` を確認し、`@updateURL` と `@downloadURL` が `.../unstable/...` になっていることを確認する
- [ ] 2.3 通常ビルド (`npm run build`) の場合は `.../stable/...` のままであることを確認する
