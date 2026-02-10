## Why

ESLint 厳格化の最終段階として、ランタイムでの `this` 関連エラー（`unbound-method`）を根絶し、副作用のある式の明確化、およびテストコードを含む完全な型安全性を達成するため。
Phase 2 で導入した型境界の強化を補完し、プロジェクト全体のコード品質と保守性を最高レベルに引き上げます。

## What Changes

- **クラスメソッド定義の統一**: 全クラスメソッドを「アロー関数プロパティ」形式に書き換え、`constructor` での `bind(this)` を廃止します。
- **厳格な ESLint ルールの有効化**:
    - `@typescript-eslint/unbound-method`: メソッドの `this` 束縛を厳格にチェック。
    - `@typescript-eslint/no-confusing-void-expression`: 戻り値のない式（void）の混同を防止。
    - `@typescript-eslint/no-unnecessary-condition`: 常に true/false になる不要な条件分岐を検出。
- **テストコードの完全な型安全化**:
    - `**/*.test.ts` において、Phase 2 で一時的に緩和した `@typescript-eslint/no-unsafe-*` ルールを再有効化します。
    - Vitest のモック操作など、`any` が発生しやすい箇所の型安全な実装。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `linting`: `@typescript-eslint/unbound-method` 等の厳格なルールと、テストコードに対する `no-unsafe-*` ルールの再適用を要件に追加。
- `ui-architecture`: コンポーネントへのメソッド受け渡しにおける `this` 束縛の安全性をアロー関数プロパティによって保証することを要件に追加。

## Impact

- **コードベース全体**: `UIManager`, `Navigator`, `Store`, `ResumeManager`, `InputManager` 等の全クラス定義。
- **テストコード**: 全ての `.test.ts` ファイル（特にモックを使用している箇所）。
- **開発体験**: `this` のバインドミスによるランタイムエラーがコンパイル時に検出されるようになり、デバッグ効率が向上します。
