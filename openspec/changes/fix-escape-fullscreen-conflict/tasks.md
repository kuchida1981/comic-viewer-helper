## 1. テストの作成

- [x] 1.1 `InputManager.test.ts` に、入力欄フォーカス時でもモーダルが開いていれば `Escape` で閉じられることを確認するテストケースを追加

## 2. 実装の修正

- [x] 2.1 `InputManager.ts` の `onKeyDown` ハンドラを修正し、モーダル閉鎖処理を優先させる
- [x] 2.2 `_handleModalCloseShortcuts` で確実に `preventDefault()` が呼ばれていることを確認

## 4. 多重ガード戦略による再修正

- [ ] 4.1 `InputManager.ts` で `window` レベルの `keydown`/`keyup` キャプチャリスナーを追加
- [ ] 4.2 `_isAnyModalOpen` を強化し、DOM 実態 (`.comic-helper-modal-overlay`) もチェックするようにする
- [ ] 4.3 既存の `onKeyDown` ハンドラから Escape 処理を移行し、グローバルに確実にガードされるようにする
- [ ] 4.4 各モーダルコンポーネント内でも `keyup` ハンドリングを追加し、ガードを盤石にする
