## MODIFIED Requirements

### Requirement: 静的解析の実施
システムは、開発者が書いたコード（テストファイルを含む全ファイル）に対して静的解析（Linting）を実行できる環境を提供しなければならない（SHALL）。テストファイルに対する `@typescript-eslint/no-explicit-any` の緩和は解除され、本番コードと同等の規則が適用される。

#### Scenario: 構文および基本ルールの検証
- **WHEN** 開発者が `npm run lint` コマンドを実行したとき
- **THEN** 構文エラーや未定義変数の使用などの問題が検出され、コンソールに報告されること

#### Scenario: テストファイル内の any 使用が検出される
- **WHEN** テストファイルに明示的な `any` 型が含まれている状態で `npm run lint` を実行する
- **THEN** `@typescript-eslint/no-explicit-any` の警告が報告され、コマンドが非0で終了する
