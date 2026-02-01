## 1. UIの更新

- [ ] 1.1 `src/ui/components/SpreadControls.js` 内のボタンテキストを `Adjust` から `Offset` に変更する
- [ ] 1.2 `src/ui/components/SpreadControls.js` 内のボタンの `title` 属性を `Shift spread pairing by 1 page (Offset)` に更新する

## 2. ロジックの実装

- [ ] 2.1 `src/main.js` の `onKeyDown` ハンドラに `o` キーの処理を追加する
- [ ] 2.2 `o` キー押下時に `isDualViewEnabled` が true の場合のみ、`spreadOffset` をトグル（0 ↔ 1）する処理を実装する

## 3. 動作確認とテスト

- [ ] 3.1 ブラウザで `Offset` ボタンのテキストとツールチップが正しく表示されることを確認する
- [ ] 3.2 `o` キー押下で、見開き表示のペアリングが正しく切り替わることを確認する
- [ ] 3.3 単一ページ表示モード（Spread チェックボックスがオフ）の時に `o` キーが反応しないことを確認する
- [ ] 3.4 ページ番号入力フォームにフォーカスがある時に `o` キーでオフセットが切り替わらないことを確認する
