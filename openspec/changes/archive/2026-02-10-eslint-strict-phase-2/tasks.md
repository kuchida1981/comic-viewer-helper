## 1. 準備とインフラの整備

- [x] 1.1 `src/type-guards.ts` を作成し、基本型のガード（`isStringArray` 等）を実装する
- [x] 1.2 `src/type-guards.ts` にドメイン固有のガード（`isGuiPos`, `isResumeData` 等）を実装する
- [x] 1.3 `src/type-guards.ts` の単体テストを作成する

## 2. プロダクションコードの改修

- [x] 2.1 `src/managers/ResumeManager.ts` の `_loadData` を改修し、型ガードを適用する
- [x] 2.2 `src/store.ts` の各ロードメソッド（`_loadGuiPos` 等）を改修し、型ガードを適用する
- [x] 2.3 `src/store.ts` 内の `JSON.parse` の戻り値を `unknown` として扱うように変更する

## 3. ESLint 設定の有効化

- [x] 3.1 `eslint.config.mjs` で `@typescript-eslint/no-unsafe-*` ルールを `error` に変更する
- [x] 3.2 `npm run lint` を実行し、エラーが発生することを確認する

## 4. テストコードの健全化（エラー解消）

- [x] 4.1 `src/logic.test.ts` 内の不安全な操作を解消する
- [x] 4.2 `src/managers/` 配下のテストファイルのエラーを解消する
- [x] 4.3 `src/store.test.ts` およびその他のテストファイルのエラーを解消する
- [x] 4.4 すべてのテストがパスし、`npm run lint` が正常終了することを確認する

## 5. 最終検証

- [x] 5.1 `npm run check-types` で型チェックが通ることを確認する
- [x] 5.2 `npm run build` が正常に完了することを確認する
- [x] 5.3 `npx openspec validate --strict --all` で仕様適合性を確認する