## 1. ナビゲーション方向定数の導入

- [x] 1.1 `src/shortcuts.js` に `NAV_DIRECTION` 定数を定義する（`{ next: 'next', prev: 'prev' }` の型で、将来の左開き対応で反転可能にする）
- [x] 1.2 `nextPage` のキー定義から `ArrowRight` を削除し、`ArrowLeft` を追加する
- [x] 1.3 `prevPage` のキー定義から `ArrowLeft` を削除し、`ArrowRight` を追加する

## 2. GUIボタンの動作マッピング反転

- [x] 2.1 `src/ui/components/NavigationButtons.js` の `configs` 配列で、`<<` の action を `onLast` に変更する
- [x] 2.2 同じ配列で、`<` の action を `onNext` に変更する
- [x] 2.3 同じ配列で、`>` の action を `onPrev` に変更する
- [x] 2.4 同じ配列で、`>>` の action を `onFirst` に変更する
- [x] 2.5 対応する `title`（tooltip）も動作に合わせて更新する

## 3. 検証

- [ ] 3.1 `<` ボタンで次のページへ、`>` ボタンで前のページへに動作が反転していることを確認する
- [ ] 3.2 `<<` ボタンで最後のページへ、`>>` ボタンで最初のページへに動作が反転していることを確認する
- [ ] 3.3 `ArrowLeft` キーで次のページへ、`ArrowRight` キーで前のページへに動作が反転していることを確認する
- [ ] 3.4 `j`/`k`, `PageDown`/`PageUp`, `Space`/`Shift+Space` の動作は変わっていないことを確認する
- [ ] 3.5 ホイールナビゲーションの動作は変わっていないことを確認する
- [ ] 3.6 最終ページで `<` ボタンまたは `ArrowLeft` キーを操作した場合に Info モーダルが自動表示されることを確認する