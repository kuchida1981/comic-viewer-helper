# linting Specification

## Purpose
TBD - created by archiving change add-lint-and-ci. Update Purpose after archive.
## Requirements
### Requirement: Static Code Analysis
システムは、開発者が書いたコードに対して静的解析（Linting）を実行できる環境を提供しなければなりません（SHALL）。

#### Scenario: Verify syntax and basic rules
- **WHEN** 開発者が `npm run lint` コマンドを実行したとき
- **THEN** 構文エラーや未定義変数の使用などの問題が検出され、コンソールに報告されること

### Requirement: UserScript Global Variables
Lintルールは、Tampermonkey固有のグローバル変数（`GM_setValue`, `GM_xmlhttpRequest` など）およびブラウザ標準のグローバル変数（`window`, `document` など）を正当なものとして認識しなければなりません（SHALL）。

#### Scenario: Use of GM functions
- **WHEN** コード内で `GM_setValue` などのTampermonkey関数を使用しているとき
- **THEN** Lintツールはそれを「未定義変数」としてエラー報告しないこと

### Requirement: 静的解析によるコード品質の維持
システムは、ESLint を使用してソースコードの構文およびスタイルを自動的に検証しなければならない。

#### Scenario: 警告が存在する場合の失敗
- **WHEN** ソースコードに Lint 警告（未使用変数など）が含まれている状態で `npm run lint` を実行する
- **THEN** コマンドは終了コード 非 0 で終了し、エラーとして報告されること

