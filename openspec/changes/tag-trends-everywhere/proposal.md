## Why

現在、お気に入り画面でのみ提供されているタグ集計（トレンド）と絞り込み機能を、検索結果、閲覧履歴、関連作品の各リストにも展開することで、作品の発見性とナビゲーションの効率を大幅に向上させます。また、一度取得したタグ情報を永続化することで、リピート閲覧時の負荷を軽減します。

## What Changes

- **作品タグの永続キャッシュ:** 取得した作品のタグ情報を `GM_storage` に保存し、セッションを跨いで利用可能にします。
- **非同期タグ取得エンジン:** リスト表示時に、キャッシュにない作品のタグをバックグラウンドで順次フェッチする仕組みを導入します。
- **共通トレンドコンポーネント:** どこのリストでも再利用可能なトレンド表示・絞り込み UI コンポーネントを作成します。
- **各モーダルへの統合:** `SearchModal`（検索）、`FavoritesModal`（履歴タブ）、`MetadataModal`（関連作品）にトレンドセクションを組み込みます。

## Capabilities

### New Capabilities
- tag-persistence: 作品URLをキーとしたタグ情報の保存・読み込み機能。
- async-tag-fetching: 表示中の作品リストに対してバックグラウンドでタグをフェッチし、Storeを更新する機能。
- trend-section-integration: 検索結果、履歴、関連作品の各UIにおけるトレンド表示とタグフィルタリングの統合。

### Modified Capabilities
- favorite-tag-trends: お気に入り専用だったロジックを汎用化し、他のリストでも利用可能にするための要件変更。

## Impact

- `src/store.ts`: タグキャッシュの状態管理と永続化処理の追加。
- `src/managers/`: 新しい `TagFetchManager` の追加、および既存の `UIManager` での統合。
- `src/ui/components/`: `TrendSection.ts` の新設。`SearchModal.ts`, `FavoritesModal.ts`, `MetadataModal.ts` のレイアウト変更。
- `src/logic.ts`: タグ集計ロジックの汎用化。
