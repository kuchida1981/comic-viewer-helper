## ADDED Requirements

### Requirement: 標準スクロールバーの非表示化
システムは、スクリプトが有効な間、ブラウザ標準の垂直スクロールバーを非表示にし、表示領域を最大化しなければならない。

#### Scenario: スクロールバーの非表示
- **WHEN** スクリプトが有効化（enabled: true）される
- **THEN** `html` 要素に特定のクラスが付与され、CSS によって `overflow: hidden` が適用される

#### Scenario: スクロールバーの復元
- **WHEN** スクリプトが無効化（enabled: false）される
- **THEN** `html` 要素からクラスが除去され、標準のスクロール挙動と表示が復元される
