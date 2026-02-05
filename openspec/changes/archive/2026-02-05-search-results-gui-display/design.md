## Context

現在の検索モーダルは入力キーワードを受け取り、`adapter.getSearchUrl(query)` で生成したURLに `window.location.href` で遷移する。
これにより閲覧途中の読み取り進捗やGUI位置など、ツール側の状態が全て失われる。

本変更では検索モーダルのサブミット動作を `fetch` に切り替え、レスポンスHTMLをパースして結果をモーダル内のグリッドで表示する。
アダプターパターンを維持し、パースロジックは `DefaultAdapter` に収容する。

## Goals / Non-Goals

**Goals:**
- キーワード検索実行後、ページ遷移なしでモーダル内に検索結果を表示する
- 件数をモーダル内で表示する
- 次ページが存在する場合に「もっと見る」リンクで対象サイトの検索結果ページに遷移できる
- パースロジックがアダプターに収まり、将来的にサイト別アダプターで拡張しやすい

**Non-Goals:**
- ページング（2ページ目以降の読み込み）は本変更の対象外
- インクリメンタルサーチ（入力中の自動再検索）は #124 で対応
- タグ検索は #125 で対応

## Decisions

### 1. パース結果の型: `SearchResult` を新規定義
**決定**: `RelatedWork` とは別に `SearchResult { title, href, thumb }` を新規定義する。
**理由**: `RelatedWork` には `isPrivate` など関連作品固有のプロパティがある。検索結果とは意味が異なり、将来的に検索結果固有のプロパティ（ページ番号など）も追加される可能性がある。

### 2. パースメソッドの戻り値
**決定**: `parseSearchResults` は `{ results: SearchResult[], totalCount: string | null, nextPageUrl: string | null }` を返す。
**理由**: 件数と次ページURLも検索結果と同じレスポンスHTMLから取得できる。まとめて返すことで fetch は1回で済む。

### 3. 検索結果グリッドのCSS
**決定**: `search-result-grid` / `search-result-item` と独立したクラス名を定義し、レイアウト値は `related-grid` と同じ（`grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))`, サムネイル比率 `3:4`）。
**理由**: `related-item` という名前は「関連作品」の意味を持ち、検索結果に適用するのは不適当。レイアウト値は同じ視覚パターンなので統一性を維持する。

### 4. 検索結果の状態管理
**決定**: `Store` に `searchResults: SearchResultsState | null` を追加し、`UIManager` が読み取り `SearchModal` に渡す。
**理由**: 既存のモーダル表示パターン（`isSearchModalOpen` をStoreで管理、UIManagerがモーダルを生成）に揃える。

### 5. もっと見る の表示条件
**決定**: `parseSearchResults` が返した `nextPageUrl` が存在する場合のみ表示し、そのURLに遷移する。
**理由**: `div.wp-pagenavi` の `a.nextpostslink` が存在すれば2ページ目以降がある。将来的にこのリンクを「次ページ読み込み」に変更するときも同じ情報を活用できる。

## Risks / Trade-offs

- **[Risk] サイト側のDOM変更でパースが壊れる** → パースロジックはアダプターに収まっているため、アダプターのみ修正で対応可能。将来的には E2E テスト（#8）で自動検知を目指す。
- **[Risk] レスポンスHTMLが大きい場合のパース性能** → `DOMParser` はブラウザネイティブで十分高速。1ページ分のHTMLが対象なので実用的には問題しない。
- **[Trade-off] もっと見る で遷移してしまうと読み取り進捗が失われる** → これは「もっと見る」をタップするという明示的な選択の結果なので許容とする。将来的にページング機能で回避できる。