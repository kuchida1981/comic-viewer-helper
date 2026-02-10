## Context

現在の ESLint 設定は TypeScript の型情報を参照しておらず、非同期処理の不適切な扱い（Floating Promises）を検知できません。また、プロジェクトの方針として「Warning 0件」を維持しており、CI でのマージをブロックしています。大規模なリファクタリングを避けつつ、バグ防止に最も寄与するルールを導入するための設計が必要です。

## Goals / Non-Goals

**Goals:**
- Type-aware linting を有効にし、Promise の誤用を Error として検出する。
- `eqeqeq` を導入し、意図しない型変換による比較ミスを防ぐ。
- 設定変更後も「Warning 0件」を維持し、既存の違反箇所をすべて修正する。

**Non-Goals:**
- Unsafe 系ルール（`no-unsafe-assignment` 等）の今回フェーズでの Error 化（Phase 2 で実施）。
- クラスメソッドのバインド（`unbound-method`）の修正（Phase 3 で実施）。
- 大規模なロジックのリファクタリング。

## Decisions

### 1. projectService の利用
ESLint の型情報解析において、`parserOptions.projectService: true` を採用します。これにより、`tsconfig.json` の場所を明示的に指定することなく、プロジェクト構造に合わせて適切に型解析が行われます。

### 2. ルール構成の段階的導入
`typescript-eslint` の `strictTypeChecked` をベースにしつつ、今回のフェーズで対応しないルール（Unsafe系、Stylistic系）は明示的に `warn` または `off` に上書きします。これにより、マージをブロックすることなく、最優先事項（Promise安全性）のみを Error 化します。

### 3. Floating Promise の修正方針
既存の 6 件の Floating Promise 違反に対しては、以下の基準で修正します。
- 副作用を期待して意図的に `await` しない場合は、`void` 演算子を付与して意図を明示する。
- バグの可能性がある場合は、適切に `await` するかエラーハンドリングを追加する。

## Risks / Trade-offs

- **[Risk]** 型解析の導入により、`npm run lint` の実行時間が延びる可能性がある。
  - **Mitigation** プロジェクト規模がまだ小さいため許容範囲内と判断。CI での計測を行い、著しく遅延する場合は設定を再考する。
- **[Risk]** `void` 演算子の多用による可読性の低下。
  - **Mitigation** 「意図的な放置」を明示することはメンテナンス上プラスに働くと考える。
