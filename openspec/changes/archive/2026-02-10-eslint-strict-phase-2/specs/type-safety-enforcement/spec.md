## ADDED Requirements

### Requirement: 外部データの境界における型検証
システムは、外部から入力されるデータ（`JSON.parse` の結果や `localStorage` からの取得値など）に対して、型ガード（Type Guard）を用いた検証を強制しなければならない（SHALL）。検証に失敗した場合は、型安全なデフォルト値を使用するか、適切にエラーを処理しなければならない（SHALL）。

#### Scenario: localStorage からのデータ取得時の検証
- **WHEN** `localStorage` からデータを読み込み、`JSON.parse` でパースしたとき
- **THEN** パースされたオブジェクトが期待される型（`GuiPos` など）に適合するか Type Guard 関数で検証される
- **AND** 適合しない場合は、`null` やデフォルト値が返される
