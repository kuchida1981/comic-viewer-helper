## Why

現在の検索モーダルは検索結果の1ページ目のみを表示し、2ページ目以降の閲覧には外部サイトへの遷移が必要です。
検索体験をモーダル内で完結させ、シームレスに全件を探索できるようにするため、モーダル内でのページング機能を導入します。

## What Changes

- **検索結果の状態拡張**: `SearchResultsState` に現在ページ、総ページ数、および各ページへのリンク情報（prev/next/page numbers）を追加します。
- **パースロジックの強化**: `DefaultAdapter` の検索結果パース処理において、サイト標準のページネーション要素（`wp-pagenavi`）からリンク情報を抽出するように拡張します。
- **ページングUIの追加**: 検索モーダル内のグリッド下部に、ページネーションコントロール（前へ、次へ、ページ番号ボタン）を追加します。
- **非同期ページ遷移の実装**: ページングボタン押下時に Ajax (fetch) を実行し、モーダル内の結果をリロードなしで更新する仕組みを実装します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `search-results-display`: 1ページ目の表示のみという制限を撤廃し、全ページを探索可能なページング機能の要件を追加します。

## Impact

- `src/types.ts`: `SearchResultsState` 型の定義変更
- `src/adapters/DefaultAdapter.ts`: `parseSearchResults` メソッドのロジック拡張
- `src/ui/components/SearchModal.ts`: ページング UI の追加とイベントハンドリング
- `src/managers/UIManager.ts`: URLベースでの検索結果取得ロジックの追加
- `src/store.ts`: ページング状態の保持
