## 1. 準備と ESLint ルールの適用

- [x] 1.1 `eslint.config.mjs` を更新し、`unbound-method`, `no-confusing-void-expression`, `no-unnecessary-condition` を有効化する
- [x] 1.2 `eslint.config.mjs` のテストファイル用緩和設定（`no-unsafe-*`）を削除する
- [x] 1.3 `npm run lint` を実行し、全エラー箇所を確認する

## 2. クラスメソッドの定義変更 (アロー関数プロパティ化)

- [x] 2.1 `src/store.ts` の全メソッドをアロー関数プロパティ化し、`constructor` の `bind` を削除する
- [x] 2.2 `src/managers/Navigator.ts` の全メソッドをアロー関数プロパティ化し、`constructor` の `bind` を削除する
- [x] 2.3 `src/managers/UIManager.ts` の全メソッドをアロー関数プロパティ化し、`constructor` の `bind` を削除する
- [x] 2.4 その他の Manager (`ResumeManager`, `InputManager`, `PopUnderBlocker`) のメソッドを修正する

## 3. ロジックコードの修正 (厳格ルール対応)

- [x] 3.1 `no-confusing-void-expression` に起因するエラーを修正する（特に Promise を返すアロー関数など）
- [x] 3.2 `no-unnecessary-condition` に起因するエラーを修正する
- [x] 3.3 プロダクションコードの `npm run lint` がパスすることを確認する

## 4. テストコードの健全化 (Unsafe ルール対応)

- [x] 4.1 `src/store.test.ts` の `unsafe` エラーを解消する
- [x] 4.2 `src/managers/` 配下の各テストファイルの `unsafe` エラーを解消する (モックの型キャスト適用)
- [x] 4.3 `src/ui/` 配下および `src/logic.test.ts` のエラーを解消する
- [x] 4.4 全テストファイルに対して `npm run lint` がパスすることを確認する

## 5. 最終検証

- [x] 5.1 `npm run test` ですべてのテストがパスし、カバレッジが維持されていることを確認する
- [x] 5.2 `npm run check-types` で型チェックが通ることを確認する
- [x] 5.3 `npm run build` が正常に完了することを確認する
- [x] 5.4 `npx openspec validate --strict --all` で仕様適合性を確認する