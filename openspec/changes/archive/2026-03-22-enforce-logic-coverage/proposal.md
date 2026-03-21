## Why

`GEMINI.md` で規定されている「コアロジック（`src/logic.ts`）のカバレッジ 100% 維持」という要件が現状達成されておらず（97.33%）、また `vitest.config.mjs` の閾値設定（95%）が緩いため、この違反を機械的に検知できていません。
品質基準を厳格に運用し、将来的なデグレードを防止するために、ツールの設定変更とテストケースの補填が必要です。

## What Changes

- **Vitest 設定の更新**: `vitest.config.mjs` に `src/logic.ts` 専用のカバレッジ閾値（100%）を追加し、1行でも未カバーがあればテストが失敗するようにします。
- **テストケースの追加**: `src/logic.ts` 内の未カバー箇所（主にガード節や異常系処理）を網羅するテストを `src/logic.test.ts` または `src/logic.safety.test.ts` に追加します。
- **要件定義の更新**: `unit-testing` spec に「コアロジックのカバレッジ 100% 強制」を明文化します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `unit-testing`: コアロジック（`src/logic.ts`）に対して 100% のテストカバレッジを強制する要件を追加します。

## Impact

- `vitest.config.mjs`: 設定変更。
- `src/logic.test.ts` / `src/logic.safety.test.ts`: テストコードの追加。
- `openspec/specs/unit-testing/spec.md`: 要件の更新。
