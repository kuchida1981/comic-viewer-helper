## 1. ロジック層の修正とテスト

- [ ] 1.1 `src/logic.ts` の `calculateTrends` 関数のシグネチャを拡張し、`selectedTags: string[]` 引数を追加する
- [ ] 1.2 `calculateTrends` のソートロジックを修正し、選択されたタグを最優先にする
- [ ] 1.3 `calculateTrends` の表示件数調整ロジックを修正し、選択されたタグが常に表示されるようにする
- [ ] 1.4 `src/logic.test.ts` に新しいソート順と表示件数調整を検証するテストケースを追加する

## 2. UI層の修正とテスト

- [ ] 2.1 `src/ui/components/FavoritesModal.ts` の `createTrendSection` を修正し、`calculateTrends` の呼び出し時に `selectedTagTexts` を渡すようにする
- [ ] 2.2 `src/ui/components/FavoritesModal.test.ts` に、タグクリック時にそのタグが先頭に移動することを検証するテストを追加する

## 3. 最終検証

- [ ] 3.1 `npm run test` を実行し、すべてのテストがパスすることを確認する
- [ ] 3.2 `npm run lint` を実行し、コードスタイルを確認する
- [ ] 3.3 `npm run check-types` を実行し、型チェックがパスすることを確認する
- [ ] 3.4 `npm run build` を実行し、ビルドエラーがないことを確認する
- [ ] 3.5 `npx openspec validate --strict --all` を実行し、仕様との整合性を確認する
