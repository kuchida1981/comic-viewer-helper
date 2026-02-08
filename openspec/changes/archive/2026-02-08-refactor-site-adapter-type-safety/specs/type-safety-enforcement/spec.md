## ADDED Requirements

### Requirement: アダプターの機能セットに基づく型安全な判定メカニズム
システムは、`SiteAdapter` が特定の機能（検索、メタデータ取得など）を備えているかを実行時に判定し、型安全にアクセスするためのメカニズムを提供しなければならない（SHALL）。

#### Scenario: 検索可能アダプターの判定
- **WHEN** `SiteAdapter` オブジェクトが `isSearchableAdapter` Type Guard 関数に渡された時
- **THEN** `getSearchUrl` および `parseSearchResults` メソッドの両方が関数として定義されている場合のみ `true` を返し、型を `SearchableAdapter` に絞り込むこと

#### Scenario: メタデータ取得可能アダプターの判定
- **WHEN** `SiteAdapter` オブジェクトが `isMetadataAdapter` Type Guard 関数に渡された時
- **THEN** `getMetadata` メソッドが関数として定義されている場合のみ `true` を返し、型を `MetadataAdapter` に絞り込むこと

### Requirement: 型アサーションの排除
アダプターのメソッドを呼び出す際は、原則として上記の判定メカニズムを使用し、非 null アサーション（`!`）の使用を最小限に抑えなければならない（SHALL）。

#### Scenario: UIManager での検索実行
- **WHEN** `UIManager` が検索を実行する時
- **THEN** 事前に `isSearchableAdapter` でチェックを行い、そのスコープ内ではアサーションなしでメソッドを呼び出すこと

#### Scenario: アプリ初期化時のメタデータ取得
- **WHEN** アプリケーションが初期化時にメタデータを取得する時
- **THEN** `isMetadataAdapter` を使用して判定を行い、安全に `getMetadata()` を呼び出すこと
