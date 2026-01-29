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

### Requirement: Recommended Ruleset
システムは、JavaScriptの標準的な推奨ルールセット（`eslint:recommended` 相当）を適用し、潜在的なエラーを防止しなければなりません（SHALL）。

#### Scenario: Detect potential errors
- **WHEN** `debugger` ステートメントの残留や、初期化前の変数使用などのコードが含まれているとき
- **THEN** Lintツールはそれを警告またはエラーとして報告すること

