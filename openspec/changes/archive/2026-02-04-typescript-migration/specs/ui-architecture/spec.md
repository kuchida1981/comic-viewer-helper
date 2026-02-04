## MODIFIED Requirements

### Requirement: コンポーネントベースの UI 構築
UI は、独立した小さな部品（コンポーネント）から構成され、共通の要素生成ユーティリティ（`createElement` など）を使用して宣言的に構築されなければならない (MUST)。また、各コンポーネントおよびユーティリティは TypeScript で記述され、適切な型定義を持つものとする。

#### Scenario: 型安全な要素生成
- **WHEN** `createElement` を呼び出して要素を生成するとき
- **THEN** 引数に渡すオプションや子要素が、TypeScript のインターフェースによって型チェックされる
