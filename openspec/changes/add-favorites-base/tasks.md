## 1. データモデルと Store の拡張

- [ ] 1.1 `src/store.ts` に `STORAGE_KEYS.FAVORITES` を追加
- [ ] 1.2 `StoreState` インタフェースに `favorites: RelatedWork[]` を追加
- [ ] 1.3 `Store` クラスの初期状態にお気に入りの読み込みロジックを追加（ドメイン別）
- [ ] 1.4 `Store._persistChanges` に `favorites` の保存処理を追加
- [ ] 1.5 `src/store.test.ts` にお気に入りの永続化に関するテストを追加

## 2. ロジックの実装（重み付けランダム選択）

- [ ] 2.1 `src/logic.ts` の `jumpToRandomWork` を重み付けアルゴリズムに更新
- [ ] 2.2 `src/logic.test.ts` に、お気に入り作品が優先的に選ばれることを確認するユニットテストを追加

## 3. UI の実装

- [ ] 3.1 `src/ui/styles.ts` にお気に入りボタン (`.comic-helper-favorite-btn`) および状態（塗りつぶし・枠線）のスタイルを追加
- [ ] 3.2 `src/ui/components/MetadataModal.ts` に、現在の作品をお気に入り登録/解除するためのトグルボタンをタイトルの横に追加
- [ ] 3.3 `src/managers/UIManager.ts` の `_updateModals` または `MetadataModal` へのコールバック経由で、お気に入り登録・解除のアクションを実装

## 4. 最終検証

- [ ] 4.1 `npm run test` を実行し、既存および新規のテストがすべてパスすることを確認
- [ ] 4.2 `npm run lint` および `npm run check-types` を実行し、静的解析エラーがないことを確認
- [ ] 4.3 `npx openspec validate --strict --all` を実行し、仕様との整合性を確認
