## 1. ロジックの追加と移動

- [ ] 1.1 `FavoritesModal.ts` から `calculateTrends` を `src/logic.ts` に移動する
- [ ] 1.2 `src/logic.ts` に `filterWorksByTags` 関数を追加する
- [ ] 1.3 `src/logic.test.ts` に `calculateTrends` と `filterWorksByTags` のテストを追加し、100%のカバレッジを確認する

## 2. スタイルの追加

- [ ] 2.1 `src/ui/styles.ts` に `.comic-helper-tag-chip.active` のスタイルを定義する（アクセントカラーでのハイライト）

## 3. UIコンポーネントの修正

- [ ] 3.1 `FavoritesModal.ts` の `createFavoritesModal` 内で `selectedTagTexts: Set<string>` による状態管理を実装する
- [ ] 3.2 `createTrendSection` を修正し、選択状態のタグに `active` クラスを付与するようにする
- [ ] 3.3 タグクリック時に `selectedTagTexts` をトグルし、モーダル内容を再描画する内部ロジックを実装する
- [ ] 3.4 お気に入りグリッドの表示前に `filterWorksByTags` を適用するように修正する

## 4. マネージャーと統合の修正

- [ ] 4.1 `UIManager.ts` の `onTagClick` ハンドラを修正し、お気に入りモーダル内では外部検索を実行しないようにする（または `FavoritesModal` 側でハンドラを完結させる）

## 5. 検証と仕上げ

- [ ] 5.1 `npm run lint` でコードスタイルを確認する
- [ ] 5.2 `npm run test` で全てのテストが通過することを確認する
- [ ] 5.3 `npm run check-types` で型チェックを行う
- [ ] 5.4 `npm run build` でビルドが成功することを確認する
- [ ] 5.5 `npx openspec validate --strict --all` で OpenSpec の整合性を確認する
