## Why

現在の ESLint 設定は構文チェックが中心であり、型情報を利用した高度な静的解析が有効になっていません。特に Promise の放置（Floating Promises）などの非同期処理に関連するミスは、ランタイムでの予期せぬ挙動やデバッグ困難なバグを引き起こす原因となります。
また、厳密等価演算子（`eqeqeq`）などの基本的な品質ルールを強制することで、コードの一貫性と安全性を向上させます。

## What Changes

- **型情報の利用 (Type-aware linting) の導入**: ESLint が TypeScript の型情報を参照できるように設定を変更します。
- **Promise 関連ルールの Error 化**: `no-floating-promises` および `no-misused-promises` を `error` に設定します。
- **厳密等価の強制**: `eqeqeq` を `error` に設定し、`==` や `!=` の使用を禁止します（`null` との比較を除く）。
- **既存コードの修正**: 上記ルールの有効化に伴い発生する既存の違反箇所（約12件）を修正します。

## Capabilities

### New Capabilities
- `type-safety-enforcement`: プロジェクト全体の型安全性を ESLint を通じて強制する能力。

### Modified Capabilities
- `linting`: 既存の静的解析の要件を拡張し、型情報を必須とするように変更。

## Impact

- `eslint.config.mjs`: 設定ファイルが型情報を参照するように更新されます。
- `package.json`: lint 実行時のパフォーマンスに若干の影響が出る可能性があります（型情報の解析が必要なため）。
- 既存のソースコード: `void` 演算子の付与や `===` への置換などの修正が数箇所発生します。
