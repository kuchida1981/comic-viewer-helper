## Context
現在、検索機能はメモリ上でのみ状態を保持しており、モーダルを閉じるたびに `searchResults: null` がセットされて初期化される。また、ページ遷移を行うとすべての検索状態が消失するため、ユーザーは同じキーワードで何度も検索し直す必要がある。

## Goals / Non-Goals

**Goals:**
- 検索キーワードおよび結果の永続化による、ページ遷移・再開時のシームレスな体験。
- SWR（Stale-While-Revalidate）パターンによる、即時表示とバックグラウンドでの最新データ取得。
- キャッシュ有効期限（デフォルト1時間）の管理。

**Non-Goals:**
- 複数キーワードの検索履歴保持（最新の1件のみを対象とする）。
- 検索結果ページングの完全なキャッシュ（最初の1ページ目、または現在のページのみを対象とする）。

## Decisions

### 1. キャッシュデータ構造の定義
`src/types.ts` に `SearchCache` インターフェースを追加し、結果データとタイムスタンプを紐付ける。

```typescript
export interface SearchCache {
  query: string;
  results: SearchResultsState;
  fetchedAt: number;
}
```

### 2. SWRフローの実装 (UIManager)
モーダルを開く際に、以下のロジックを実行する。
- キャッシュが存在する場合：即座に `store.setState({ searchResults: cache.results })` を実行。
- キャッシュが期限切れ、または存在しない場合：`_performSearch(query)` を実行。
- キャッシュはあるが期限切れの場合：キャッシュを表示した上で「サイレントモード」で検索を実行する。

### 3. サイレント更新の表示 (UI)
バックグラウンドで更新中であることを示すため、`SearchModal` 内に小さなインジケータ（スピナーやドット）を表示する。

### 4. 永続化のタイミング
`Store` の `setState` 時に、`searchQuery` と `searchCache` も `localStorage` に保存する。容量制限を考慮し、シリアライズ後のサイズが極端に大きい場合はキャッシュをスキップするガードを入れる。

## Risks / Trade-offs

- **[Risk] キャッシュ表示による「情報の古さ」** → [Mitigation] SWRによって即座に更新を開始し、UIに更新中であることを明示する。
- **[Risk] localStorage の容量制限 (5MB)** → [Mitigation] 検索結果は最新の1件（1ページ分）のみを保存し、古いキャッシュは上書きする。
- **[Risk] 更新時のUIのガタつき** → [Mitigation] リストの差分更新ではなく全入れ替えを行うが、ローディングインジケータを小さく留めることで視覚的衝撃を和らげる。
