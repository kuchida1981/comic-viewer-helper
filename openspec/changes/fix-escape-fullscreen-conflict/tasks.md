## 1. テストの作成

- [ ] 1.1 `InputManager.test.ts` に、入力欄フォーカス時でもモーダルが開いていれば `Escape` で閉じられることを確認するテストケースを追加

## 2. 実装の修正

- [ ] 2.1 `InputManager.ts` の `onKeyDown` ハンドラを修正し、モーダル閉鎖処理を優先させる
- [ ] 2.2 `_handleModalCloseShortcuts` で確実に `preventDefault()` が呼ばれていることを確認

## 3. 検証と仕上げ

- [ ] 3.1 `npm run test` で全てのテストがパスすることを確認
- [ ] 3.2 `npm run lint` および `npm run check-types` でコード品質を確認
- [ ] 3.3 `npm run build` でビルドが通ることを確認
