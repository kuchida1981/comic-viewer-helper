## Why

`SiteAdapter` インターフェースにおける `getSearchUrl` や `parseSearchResults` などの省略可能な（optional）メソッドの呼び出しにおいて、実行前のチェックが散発的であり、型アサーション（`!`）の使用や冗長な実行時チェックが発生しています。これを整理し、型レベルでの安全性を高めることで、開発効率とコードの堅牢性を向上させます。

## What Changes

- `SiteAdapter` から特定の機能セット（検索、メタデータ取得など）を分離したサブインターフェース（`SearchableAdapter`, `MetadataAdapter` 等）を定義します。
- 各サブインターフェースへの適合性を判定するための Type Guard 関数（`isSearchableAdapter`, `isMetadataAdapter` 等）を導入します。
- `UIManager` および `App` (main.ts) におけるアダプターメソッドの呼び出し箇所を、Type Guard を使用した型安全なパターンにリファクタリングします。
- テストコードにおける非 null アサーション（`!`）の使用を削減し、より安全なテスト記述を推進します。

## Capabilities

### New Capabilities
- `type-safety-enforcement`: アダプターの機能セットに応じた型安全なアクセスメカニズムを提供します。

### Modified Capabilities
- `site-adapter`: アダプターのインターフェース構造を、機能ごとのサブインターフェースに分離・整理できるように拡張します。

## Impact

- `src/types.ts`: 新しいインターフェースと Type Guard の追加。
- `src/managers/UIManager.ts`: 検索ロジックの型安全な実装。
- `src/main.ts`: メタデータ取得ロジックの型安全な実装。
- `src/adapters/DefaultAdapter.test.ts`: テストコードの型安全性向上。
