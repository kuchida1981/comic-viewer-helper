# type-safety-enforcement

## Purpose
プロジェクト全体の型安全性を ESLint を通じて強制し、ランタイムエラーのリスクを最小化します。

## Requirements

### Requirement: 非同期処理の安全性の強制
システムは、非同期関数（Promise）が適切に処理（await されるか、明示的に無視）されることを強制しなければならない（SHALL）。

#### Scenario: Floating Promise の検出
- **WHEN** 非同期関数を呼び出し、`await` も `.then()` もせず、`void` 演算子による明示的な無視も行わないコードに対して `npm run lint` を実行したとき
- **THEN** ESLint は `no-floating-promises` エラーを報告し、コマンドは失敗すること

### Requirement: 厳密等価演算子の強制
システムは、値の比較において厳密等価演算子（`===`, `!==`）の使用を強制しなければならない（SHALL）。

#### Scenario: 抽象等価演算子の検出
- **WHEN** `==` または `!=` を使用している箇所（`null` との比較を除く）に対して `npm run lint` を実行したとき
- **THEN** ESLint は `eqeqeq` エラーを報告し、コマンドは失敗すること

### Requirement: 外部データの境界における型検証
システムは、外部から入力されるデータ（`JSON.parse` の結果や `localStorage` からの取得値など）に対して、型ガード（Type Guard）を用いた検証を強制しなければならない（SHALL）。検証に失敗した場合は、型安全なデフォルト値を使用するか、適切にエラーを処理しなければならない（SHALL）。

#### Scenario: localStorage からのデータ取得時の検証
- **WHEN** `localStorage` からデータを読み込み、`JSON.parse` でパースしたとき
- **THEN** パースされたオブジェクトが期待される型（`GuiPos` など）に適合するか Type Guard 関数で検証される
- **AND** 適合しない場合は、`null` やデフォルト値が返される