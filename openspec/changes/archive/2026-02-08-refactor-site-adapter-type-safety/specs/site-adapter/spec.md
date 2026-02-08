## ADDED Requirements

### Requirement: 機能別サブインターフェースの定義
`SiteAdapter` は、必要に応じて特定の機能セットを定義するサブインターフェースに分割されなければならない（SHALL）。

#### Scenario: 検索機能の分離
- **WHEN** 検索機能を提供するアダプターを定義する時
- **THEN** `SearchableAdapter` インターフェースを実装（または適合）し、必要なメソッド（`getSearchUrl`, `parseSearchResults`）を提供すること

#### Scenario: メタデータ機能の分離
- **WHEN** メタデータ抽出機能を提供するアダプターを定義する時
- **THEN** `MetadataAdapter` インターフェースを実装（または適合）し、`getMetadata` メソッドを提供すること
