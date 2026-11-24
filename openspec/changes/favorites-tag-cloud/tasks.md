## 1. ロジック

- [x] 1.1 `src/logic.ts` に `calculateTagCloudLevel(count, min, max, levels)` を追加する(純粋関数、DOM非依存)
- [x] 1.2 `src/logic.test.ts` に境界値(min/max/同数/単一タグ/中間値)のテストを追加し、カバレッジ100%を維持する

## 2. UI

- [x] 2.1 `src/i18n.ts` に日本語/英語の文言を追加する(「一覧」「タグクラウド」「タグがありません」等)
- [x] 2.2 `FavoritesModal.ts` に `createTagCloudSection` を追加する(`calculateTrends` で集計、段階クラス付与)
- [x] 2.3 `FavoritesModal.ts` のお気に入りパネルに「一覧 / タグクラウド」切替を追加し、ビュー状態を保持する
- [x] 2.4 タグクラウドのクリックで選択タグに追加し、一覧ビューへ切り替えて絞り込み表示する
- [x] 2.5 `updateFavorites` / `updatePinnedTags` でクラウドビュー表示中も再描画されるようにする
- [x] 2.6 `src/ui/styles.ts` にタグクラウド用スタイル(段階別フォントサイズ)を追加する

- [x] 2.7 タグクラウドの表示を出現件数上位30件に制限する(`TAG_CLOUD_LIMIT`)
- [x] 2.8 上限を超えるタグが表示されないこと、30種類以下なら全件表示されることのテストを追加する

## 3. テスト・品質確認

- [x] 3.1 `FavoritesModal` のコンポーネントテストを追加する(ビュー切替、クリックで絞り込み、タグ0件、更新時のビュー維持)
- [x] 3.2 `make all` を実行し、すべて成功することを確認する
- [x] 3.3 README に記載が必要か確認し、必要なら更新する
