## Context

現在の検索機能は、検索結果の最初の1ページ目のみを Ajax で取得・表示し、2ページ目以降の閲覧は対象サイトの標準検索ページへ遷移する仕様となっています。
ユーザーがビューアーの GUI モーダル内で検索結果を連続して探索できるようにするため、モーダル内でのページング機能を実装します。

## Goals / Non-Goals

**Goals:**
- 検索モーダル内での複数ページにわたる検索結果の閲覧。
- 前後のページ、および指定されたページ番号への Ajax による非同期遷移。
- ページ遷移後も検索キーワードを維持しつつ、結果グリッドを更新。

**Non-Goals:**
- 無限スクロールの実装（今回はボタンベースのページネーションとする）。
- 検索フィルタ（カテゴリ絞り込み等）の追加。

## Decisions

### 1. データ構造の拡張 (`src/types.ts`)
- **決定**: `SearchResultsState` に `pagination` プロパティを追加する。
- **内容**: 
  ```typescript
  export interface PaginationItem {
    label: string;
    url: string | null;
    isCurrent: boolean;
    type: 'page' | 'prev' | 'next' | 'extend';
  }
  export interface SearchResultsState {
    // ...既存フィールド
    pagination: PaginationItem[];
  }
  ```
- **理由**: サイトの `wp-pagenavi` が持つ「前へ」「次へ」「1, 2, 3...」「... (省略)」といった多様なリンク構造を汎用的に UI で再現するため。

### 2. パースロジックの強化 (`src/adapters/DefaultAdapter.ts`)
- **決定**: `parseSearchResults` で `div.wp-pagenavi` 内の全要素を走査する。
- **内容**: `.current`, `a.page`, `a.nextpostslink`, `a.previouspostslink`, `span.extend` などのクラスを判別し、順番を維持したまま `PaginationItem` 配列に変換する。
- **理由**: サイト側のページング UI の順序や構造を最大限に尊重し、ユーザーに違和感のない操作感を提供するため。

### 3. 通信ロジックの抽象化 (`src/managers/UIManager.ts`)
- **決定**: `performSearch` メソッドを「URL」を受け取れるように拡張する。
- **内容**: `onSearch(query)` は `getSearchUrl(query)` を生成して内部メソッドを呼び出し、`onPageChange(url)` はその URL を直接内部メソッドに渡す。
- **理由**: キーワードベースの新規検索と、URLベースのページ遷移を同一の fetch/parse フローで処理するため。

### 4. UI コンポーネントの刷新 (`src/ui/components/SearchModal.ts`)
- **決定**: グリッド下部に専用の `Pagination` セクションを追加する。
- **内容**: `searchResults.pagination` が存在する場合、各アイテムをボタンとしてレンダリングする。`isCurrent` の場合はハイライトし、`url` が無い（extend等）場合は無効化する。
- **理由**: ページング状態を視覚的に分かりやすく示し、ワンクリックでページ移動できるようにするため。

## Risks / Trade-offs

- **[Risk]** ページ数の極端に多い検索結果での UI 崩れ → **[Mitigation]** フレキシブルボックスによる折り返しを許容するか、あるいはサイト側の「...」による省略ロジックをそのまま利用することで、ボタンの数が一定以上に増えないようにする。
- **[Trade-off]** Ajax 遷移による URL 同期の問題 → **[Decision]** モーダル内の遷移では `pushState` 等によるブラウザ URL の更新は行わない（モーダルを閉じれば現在の作品ページに戻るという既存の直感を優先する）。ただし、検索キーワードは `Store` を通じて維持される。
