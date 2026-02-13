## 1. 実装

- [x] 1.1 `src/managers/InputManager.ts` の `_handleToggleShortcuts` に `metadata` ショートカットのトグル処理を追加
- [x] 1.2 `src/managers/InputManager.ts` の `_handleShortcutAction` から `metadata` アクションを削除（重複防止）

## 2. 検証

- [x] 2.1 `src/managers/InputManager.test.ts` に、Infoモーダル表示中に 'i' キーで閉じることを確認するテストケースを追加
- [x] 2.2 既存のテストスイート (`npm run test`) がすべてパスすることを確認
- [x] 2.3 リンター (`npm run lint`) および型チェック (`npm run check-types`) を実行し、エラーがないことを確認
- [x] 2.4 ビルド (`npm run build`) が成功することを確認
