# Spec Delta

## MODIFIED Requirements

### Requirement: テストカバレッジの自動計測
システムは、テスト実行時にコードの網羅率（カバレッジ）を自動的に計測し、レポートを生成しなければならない（SHALL）。

#### Scenario: カバレッジレポートの生成
- **WHEN** `npm test` が実行される
- **THEN** `coverage` ディレクトリにレポートが出力されること

### Requirement: 静的型チェックの実施
システムは、TypeScript の型定義に基づいてコードの整合性を静的に検証できなければならない（SHALL）。

#### Scenario: 型エラーの検知
- **WHEN** 関数に対して誤った型の引数を渡すコードが存在する
- **THEN** 型チェックコマンドがエラーを報告すること
