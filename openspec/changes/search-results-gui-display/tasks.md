## 1. 型定義

- [x] 1.1 `types.ts` に `SearchResult { title, href, thumb }` を追加
- [x] 1.2 `types.ts` に `SearchResultsState { results, totalCount, nextPageUrl }` を追加
- [x] 1.3 `SiteAdapter` インターフェースに `parseSearchResults?(doc: Document): SearchResultsState` を追加

## 2. アダプター実装

- [x] 2.1 `DefaultAdapter` に `parseSearchResults(doc: Document)` を実装
  - `div.post-list > a` から `SearchResult[]` を抽出
  - `div.page-h > span` から件数テキストを抽出（存在しなければ `null`）
  - `div.wp-pagenavi > a.nextpostslink` から次ページURLを抽出（存在しなければ `null`）

## 3. Store の拡張

- [x] 3.1 `StoreState` に `searchResults: SearchResultsState | null` を追加（初期値: `null`）

## 4. 検索モーダルの変更

- [x] 4.1 `SearchModal` の `onSearch` コールバックの型を変更し、検索結果データを受け取れるようにする
- [x] 4.2 `SearchModal` に検索結果グリッド表示を追加（件数・アイテム一覧・もっと見る）
  - グリッドは `search-result-grid` クラスで構成（レイアウト値: `related-grid` と同じ）
  - アイテムは `search-result-item` クラスで構成（サムネイル比率 3:4）
  - もっと見る は `nextPageUrl` が存在する場合のみ表示
- [x] 4.3 検索結果が0件の場合の「結果が見つかりませんでした」メッセージを追加

## 5. UIManager の変更

- [x] 5.1 `SearchModal` の `onSearch` で `fetch` を実行し、`DOMParser` でレスポンスをパースする
- [x] 5.2 `adapter.parseSearchResults` を呼び出し、結果を `store.setState({ searchResults })` で保持する
- [x] 5.3 `store.searchResults` の変更を検知し、`SearchModal` に渡す

## 6. スタイル

- [x] 6.1 `styles.ts` に検索結果グリッド用スタイルを追加
  - `.comic-helper-search-result-grid`
  - `.comic-helper-search-result-item`
  - `.comic-helper-search-result-thumb`
  - `.comic-helper-search-result-title`
  - `.comic-helper-search-more-link`（もっと見る）

## 7. テスト

- [x] 7.1 `DefaultAdapter.parseSearchResults` のユニットテスト（アイテム・件数・次ページURL の抽出・欠損時の `null`）
- [x] 7.2 `SearchModal` の検索結果表示・もっと見る・0件メッセージのテスト
