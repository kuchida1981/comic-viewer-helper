# linting

## Purpose
ソースコードの静的解析（ESLint）を通じて、構文エラーの防止とコードスタイルの統一を自動化します。

## Requirements

### Requirement: 静的解析の実施
システムは、開発者が書いたコードに対して静的解析（Linting）を実行できる環境を提供しなければならない（SHALL）。

#### Scenario: 構文および基本ルールの検証
- **WHEN** 開発者が `npm run lint` コマンドを実行したとき
- **THEN** 構文エラーや未定義変数の使用などの問題が検出され、コンソールに報告されること

### Requirement: UserScript グローバル変数の許容
Lintルールは、Tampermonkey 固有のグローバル変数およびブラウザ標準のグローバル変数を正当なものとして認識しなければならない（SHALL）。

#### Scenario: GM関数の使用
- **WHEN** コード内で `GM_setValue` などの関数を使用しているとき
- **THEN** Lintツールはエラーを報告しないこと

### Requirement: 警告の厳格な処理
システムは、Lint の警告（Warning）もエラーとして扱い、ビルドや CI を失敗させなければならない（SHALL）。

#### Scenario: 警告が存在する場合の失敗
- **WHEN** ソースコードに Lint 警告が含まれている状態で `npm run lint` を実行する
- **THEN** コマンドは終了コード 非 0 で終了すること
