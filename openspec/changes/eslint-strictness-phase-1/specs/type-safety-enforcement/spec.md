## ADDED Requirements

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
