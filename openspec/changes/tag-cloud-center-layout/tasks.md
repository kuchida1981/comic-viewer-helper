## 1. ロジック（`src/logic.ts`）

- [ ] 1.1 順位順の配列を中央から外側へ並べ替える `arrangeCenterOut` を追加する
- [ ] 1.2 `logic.test.ts` に 0件・1件・偶数件・奇数件・順位の維持（元配列を変更しない）のテストを追加し、100% カバレッジを維持する

## 2. UI

- [ ] 2.1 `FavoritesModal.ts` の `createTrendSection` で、`calculateTrends` の結果に `arrangeCenterOut` を適用して描画する
- [ ] 2.2 `styles.ts` の `.comic-helper-favorites-trend-tags` に `justify-content: center` を追加する
- [ ] 2.3 `FavoritesModal.test.ts` に、中央配置・上位10件・すべて表示・ピン留め/選択中の配置のテストを追加する

## 3. 検証

- [ ] 3.1 `make all` が成功することを確認する
- [ ] 3.2 `openspec validate --strict --all` が成功することを確認する
