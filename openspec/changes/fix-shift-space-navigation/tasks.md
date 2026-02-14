## 1. テストの準備

- [ ] 1.1 `src/managers/InputManager.test.ts` に `Space` と `Shift+Space` の区別を確認するテストケースを追加

## 2. 実装

- [ ] 2.1 `src/managers/InputManager.ts` の `matchesShortcut` 関数を修正し、名前付きキーと文字キーを区別して判定するロジックを実装

## 3. 検証

- [ ] 3.1 `npm run test` を実行し、追加したテストおよび既存のテストがすべてパスすることを確認
- [ ] 3.2 `npm run lint` および `npm run check-types` を実行し、コード品質を確認
- [ ] 3.3 `npm run build` を実行し、ビルドエラーがないことを確認
