## Why

現在の `src/` 以下のコードベースは JavaScript (JSDoc) で記述されており、型チェックは行われているものの、TypeScript への完全な移行によってより強力な型安全性、開発体験 (DX) の向上、および将来的なメンテナンス性の確保を目指します。

## What Changes

- `src/` 以下のすべての `.js` ファイルを `.ts` に変換します。
- `tsconfig.json` を更新し、`strict: true` を維持しつつ TypeScript ファイルをネイティブに扱う設定にします。
- ESLint を TypeScript 対応（`typescript-eslint`）に更新し、型情報を活用した静的解析を導入します。
- `scripts/build.mjs` を修正し、`.ts` ファイルのインポートや結合プロセスを調整します。
- **BREAKING**: 内部的な型定義の変更により、一部の内部 API のシグネチャが厳密になる可能性がありますが、UserScript としての外部挙動に変更はありません。

## Capabilities

### New Capabilities
- `typescript-toolchain`: TypeScript 移行に伴うビルドプロセス、リント設定、および型チェックの基盤整備。

### Modified Capabilities
- `unit-testing`: テストファイルを `.ts` に移行し、TypeScript 環境でのテスト実行を保証します。
- `ui-architecture`: UI コンポーネントおよびユーティリティの型定義を強化し、DOM 操作の安全性を高めます。
- `state-management`: `Store` の状態管理に厳密な型を適用し、メタデータや状態遷移の安全性を向上させます。

## Impact

- `src/` 以下の全ファイル（`.js` -> `.ts`）
- `package.json` (devDependencies の追加)
- `tsconfig.json`, `eslint.config.mjs`, `vite.config.mjs`, `vitest.config.mjs`
- `scripts/build.mjs`
- `src/header.js` (UserScript メタデータの扱い)
