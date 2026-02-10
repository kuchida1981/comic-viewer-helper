## Why

ESLint 厳格化の第2段階として、`any` 型を経由した不安全な操作（unsafe assignment, member access, call, return）を禁止し、システムの型安全性を境界レベル（API、JSON.parse、localStorage等）で強化します。これにより、型チェックのバイパスによるランタイムエラーを未然に防ぎます。

## What Changes

- **ESLint 設定の更新**: Phase 1 で `off` に設定されていた `@typescript-eslint/no-unsafe-*` ルールを `error` に変更します。
- **型ガードの導入**: `JSON.parse` や `localStorage` から取得した `unknown` なデータに対して、型安全を保証するための Type Guard 関数群を導入します。
- **データ取得部の改修**: `Store` や `ResumeManager` 等の境界部分で、取得したデータに対して型ガードを適用するように変更します。
- **テストコードの健全化**: 大量に発生しているテストコード内の unsafe エラー（主にモックや DOM 操作に起因）を、適切な型定義やヘルパー関数の利用により解消します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `linting`: Phase 2 の厳格な不安全操作禁止ルールが適用されるように要件を更新します。
- `type-safety-enforcement`: 型の境界（データ入力部）における型検証の強制を要件に加えます。
- `state-management`: `localStorage` からのデータ読み込み時に型安全性が保証されることを要件に加えます。
- `reading-position-persistence`: 保存された位置データの読み込み時に型安全性が保証されることを要件に加えます。

## Impact

- **プロダクションコード**: `src/store.ts`, `src/managers/ResumeManager.ts` 等のデータ取得ロジック。
- **テストコード**: ほぼすべてのテストファイル（約190箇所の修正が必要）。
- **開発プロセス**: `any` の使用がより厳しく制限されるようになります。
