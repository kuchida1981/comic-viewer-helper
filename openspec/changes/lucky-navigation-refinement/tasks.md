## 1. 抽選ロジックの改善 (Logic)

- [ ] 1.1 `src/logic.ts` に `FAVORITE_PICK_CHANCE = 0.25` 定数を追加
- [ ] 1.2 `pickRandomWork` 内のマジックナンバーを `FAVORITE_PICK_CHANCE` に置き換え

## 2. 履歴管理の改善 (Store)

- [ ] 2.1 `src/store.ts` の `addLuckyHistory` をリファクタリングし、全要素の正規化と `Set` による重複排除を実装

## 3. 検証

- [ ] 3.1 ユニットテストを実行し、既存の挙動が壊れていないことを確認 (`npm run test`)
- [ ] 3.2 履歴保存時の正規化を検証するテストケースを `src/store.test.ts` に追加
- [ ] 3.3 全ての品質チェックを実行 (`npm run check-types`, `npm run lint`, `npm run build`, `npx openspec validate --strict --all`)
