## 1. ロジックの修正

- [x] 1.1 `src/logic.ts` の `calculateTrends` に `limit: number = 10` パラメータを追加し、0 または undefined の場合に制限を解除するよう修正する
- [x] 1.2 `src/logic.test.ts` に `calculateTrends` の `limit` パラメータを検証する新しいテストケースを追加する

## 2. 国際化対応 (i18n)

- [x] 2.1 `src/i18n.ts` の `MESSAGES` にトグルボタン用のキーを追加する (`ui.showAllTags`, `ui.showTopTags` 等)

## 3. UIコンポーネントの修正 (FavoritesModal)

- [x] 3.1 `src/ui/components/FavoritesModal.ts` の `createFavoritesModal` 内に `showAllTags: boolean = false` の状態管理を追加する
- [x] 3.2 `createTrendSection` の引数に `showAllTags: boolean` を追加し、`calculateTrends` の呼び出し時にこのフラグを渡す
- [x] 3.3 `createTrendSection` 内のラベル横に、`showAllTags` をトグルするためのボタン（またはリンク）を追加する
- [x] 3.4 `rerenderFavoritesPanel` 関数を修正し、`showAllTags` の状態変更を `createTrendSection` に反映させる

## 4. スタイルと統合の調整

- [x] 4.1 `src/ui/styles.ts` を修正し、トレンドタグのコンテナ (`.comic-helper-favorites-trend-tags`) に `max-height` と `overflow-y: auto` を設定して、大量のタグがある場合にスクロール可能にする
- [x] 4.2 トグルボタンのスタイルを定義し、既存の UI と調和させる
- [x] 4.3 `src/ui/components/FavoritesModal.test.ts` に、タグ表示の切り替えを検証するテストを追加する

## 5. 最終検証

- [x] 5.1 `npm run test` を実行し、ロジックおよび UI の全てのテストがパスすることを確認する
- [x] 5.2 `npm run build` でビルドエラーがないことを確認する
- [x] 5.3 `npx openspec validate --strict --all` で OpenSpec の整合性を確認する
