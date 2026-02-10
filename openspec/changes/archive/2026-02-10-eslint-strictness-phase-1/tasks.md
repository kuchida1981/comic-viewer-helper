## 1. ESLint 設定の更新

- [x] 1.1 `eslint.config.mjs` に `parserOptions.projectService` を設定し、型解析を有効化
- [x] 1.2 `strictTypeChecked` 設定を導入し、Promise 関連ルール（`no-floating-promises`, `no-misused-promises`）を `error` に設定
- [x] 1.3 `eqeqeq` ルールを `error` に設定
- [x] 1.4 Phase 2 以降で対応するルール（Unsafe系など）を一時的に `warn` または `off` に設定してエラーを抑制

## 2. 既存コードの修正

- [x] 2.1 Floating Promise 違反箇所（`UIManager.ts` 等）の修正（`void` 付与または `await`）
- [x] 2.2 `eqeqeq` 違反箇所の修正
- [x] 2.3 その他、新設定によって発生する微細なエラーの修正

## 3. 検証と最終確認

- [x] 3.1 `npm run lint` を実行し、Warning 0件でパスすることを確認
- [x] 3.2 `npm run test` を実行し、既存のテストが壊れていないことを確認
- [x] 3.3 `npm run check-types` および `npm run build` が正常に完了することを確認
- [x] 3.4 `npx openspec validate --strict --all` で OpenSpec の整合性を確認