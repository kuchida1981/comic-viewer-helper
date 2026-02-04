## 1. 実装

- [ ] 1.1 `jumpToPage` の loaded パス（`Navigator.js` 115-119行目付近）を修正: `scrollIntoView` を `applyLayout(index)` に切り替え、`pendingTargetIndex = null` を `requestAnimationFrame` 内に移動し、その後の `this.pendingTargetIndex = null`（メソッド末尾）には到達しないように `return true` で早期リターンする
- [ ] 1.2 `scrollToImage` の loaded パス（`Navigator.js` 171-173行目付近）を修正: `scrollIntoView({ behavior: 'smooth' })` はそのまま維持し、直後の `this.pendingTargetIndex = null` を `requestAnimationFrame` 内に移動し、その後の `this.pendingTargetIndex = null`（メソッド末尾）には到達しないように早期リターンする

## 2. コード構造の確認

- [ ] 2.1 修正後の `jumpToPage` loaded パスが `scrollToEdge`（196-202行目）と同じパターン（`applyLayout(index)` → RAF 内で `pendingTargetIndex = null`）になっていることを読んで確認する
- [ ] 2.2 修正後の `scrollToImage` loaded パスで `this.pendingTargetIndex = null` が RAF 以外の場所に残っていないことを確認する（メソッド末尾の naked `null` 代入が削除されていること）

## 3. 動作確認

潜在バグなので自然な操作では再現しにくい。以下で**回帰がないこと**と**修正の意図된動作変化**を確認する。

- [ ] 3.1 ページジャンプの瞬間移動確認: ページ番号入力フォームに任意の番号を入力し Enter を押し、対象ページに**瞬間移動**（スムーズスクロールではなく即座に移動）されることを確認する。これは修正による意図的な動作変化であり正常な動作である
- [ ] 3.2 ページスクロールのスムーズスクロール確認: `j` / `k` キーで次・前ページへ移動し、**スムーズスクロール**で移動されることを確認する
- [ ] 3.3 scrollToEdge の回帰確認: 「最初に戻る」「最後に進む」ボタンを押し、正常に先頭・末尾ページに移動されることを確認する
- [ ] 3.4 コンソールログによる割り込み確認: ブラウザ DevTools の Console を開き、ページロード直後に素早く `j` キー連打や ページジャンプを行い、以下を確認する:
  - `[Navigator] Skipping auto applyLayout because navigation is pending` と表示される場合は、ナビゲーション中に画像 load イベントが発火したが正しくガードされていることを意味する（正常）
  - ナビゲーション完了後に予期せぬ `[Navigator] Executing scrollIntoView` が発火しないことを確認する
- [ ] 3.5 見開き表示での確認: 見開きモード（`d` キー）を有効にし、3.1〜3.3と同じ操作を繰り返し、見開き表示でも正常に動作することを確認する

## 4. CI・静的チェック

- [ ] 4.1 `npm run test` が全て緑
- [ ] 4.2 `npm run lint` が全て緑
- [ ] 4.3 `npm run check-types` が全て緑
- [ ] 4.4 `openspec validate --strict --all` が全て緑
- [ ] 4.5 `IS_UNSTABLE=true npm run build` が正常に完了
