## Why

TypeScript移行に伴い、テストコードに付与された `// @ts-nocheck` は、テスト自体の型安全性を損なわせ、リファクタリング時のバグ検出を困難にしています。
テストコードの型付けを強化することで、実装コードの変更に対する耐性を高め、テストの信頼性を向上させます。

## What Changes

- すべてのテストファイル (`src/**/*.test.ts`) から `// @ts-nocheck` を削除します。
- `vi.mock` や `vi.stubGlobal` で使用されているモックオブジェクトに適切な型定義を適用します。
- `jsdom` 環境における DOM 操作（`style` プロパティへのアクセス等）の型エラーを修正します。
- 必要に応じて、テスト用の型定義ヘルパーやユーティリティを導入します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `typescript-toolchain`: テストコードを含めた全コードベースでの型チェックの厳格化
- `unit-testing`: テストコードの記述スタイルの標準化（型安全なモックの利用）

## Impact

- **対象ファイル**: `src/**/*.test.ts` (14ファイル)
- **開発ツール**: `npm run check-types` の実行時間が若干増加する可能性がありますが、型安全性が向上します。
- **ESLint**: `eslint.config.mjs` のテスト向け緩和ルールの見直し。
