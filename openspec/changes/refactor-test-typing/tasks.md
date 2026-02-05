## 1. 準備と環境整備

- [ ] 1.1 `localStorage` の型安全なモックヘルパーを `src/test/mocks/storage.ts` に作成する
- [ ] 1.2 `eslint.config.mjs` の `@typescript-eslint/ban-ts-comment` を `warn` に変更し、既存のテストファイルでの修正を促す

## 2. 基礎的なテストのリファクタリング（小規模・独立したモジュール）

- [ ] 2.1 `src/i18n.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 2.2 `src/store.test.ts` の `// @ts-nocheck` を削除し、`localStorage` ヘルパーを適用して型エラーを修正する
- [ ] 2.3 `src/ui/utils.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する

## 3. マネージャー・ロジック系のリファクタリング

- [ ] 3.1 `src/logic.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 3.2 `src/managers/PopUnderBlocker.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 3.3 `src/managers/ResumeManager.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 3.4 `src/managers/InputManager.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 3.5 `src/managers/Navigator.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 3.6 `src/adapters/DefaultAdapter.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する

## 4. UIコンポーネント・DOM操作系のリファクタリング

- [ ] 4.1 `src/ui/components/LoadingIndicator.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 4.2 `src/ui/components/ProgressBar.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 4.3 `src/ui/components/components.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 4.4 `src/ui/Draggable.test.ts` の `// @ts-nocheck` を削除し、型エラーを修正する
- [ ] 4.5 `src/managers/UIManager.test.ts` の `// @ts-nocheck` を削除し、型安全なコンポーネントモックを適用して型エラーを修正する

## 5. 最終確認とクリーンアップ

- [ ] 5.1 `npm run check-types` を実行し、全ファイルで型エラーがないことを確認する
- [ ] 5.2 `npm test` を実行し、すべてのテストがパスすることを確認する
- [ ] 5.3 `eslint.config.mjs` のテスト向け緩和設定 (`@typescript-eslint/no-explicit-any: off`) を見直し、必要に応じて制限を強める
