# Spec Delta

## ADDED Requirements

### Requirement: 不要な条件分岐チェックの全ファイル適用
システムは、`@typescript-eslint/no-unnecessary-condition` ルールを特定のソースファイルに対してファイル単位で無効化せず、すべての TypeScript ファイルに適用しなければならない（SHALL）。

#### Scenario: 冗長な条件式・オプショナルチェーンの検出
- **WHEN** 常に真偽が確定している条件式や非 null 値に対する不要なオプショナルチェーンがコードに含まれる状態で `npm run lint` を実行する
- **THEN** `@typescript-eslint/no-unnecessary-condition` エラーが報告され、コマンドが失敗すること
