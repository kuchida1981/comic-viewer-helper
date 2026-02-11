## 1. テストの作成

- [x] 1.1 `InputManager.test.ts` に、入力欄フォーカス時でもモーダルが開いていれば `Escape` で閉じられることを確認するテストケースを追加

## 2. 実装の修正

- [x] 2.1 `InputManager.ts` の `onKeyDown` ハンドラを修正し、モーダル閉鎖処理を優先させる
- [x] 2.2 `_handleModalCloseShortcuts` で確実に `preventDefault()` が呼ばれていることを確認

## 4. 再修正（不具合解消せず）

- [x] 4.1 `InputManager.ts` に `stopImmediatePropagation()` を追加し、`e.key` の判定を強化する
- [x] 4.2 必要に応じて `SearchModal.ts` などの各コンポーネント側でも `Escape` の伝搬を阻止する
