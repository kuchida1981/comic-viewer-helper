## 1. 型定義とStoreの拡張

- [x] 1.1 `src/types.ts` に `SearchContext` 型を定義し、`SearchResultsState` を拡張する
- [x] 1.2 `src/store.ts` の `StoreState` に `searchContext` を追加し、初期化と永続化（必要な場合）を更新する

## 2. UIコンポーネントの改善

- [x] 2.1 `src/ui/components/MetadataModal.ts` に `onTagClick` コールバックを追加し、タグクリック時に呼び出すようにする
- [x] 2.2 `src/ui/components/SearchModal.ts` の `createResultsSection` を修正し、`searchContext` に基づいた条件ラベル（「タグ: XXX」等）を表示するようにする

## 3. UIManager の検索ロジック拡張

- [x] 3.1 `src/managers/UIManager.ts` の `_performSearch` メソッドを拡張し、`searchContext` を引数に取れるようにする
- [x] 3.2 `UIManager.updateUI` 内の `MetadataModal` 作成時に `onTagClick` ハンドラを渡し、内部検索を起動するようにする
- [x] 3.3 タグ検索時には `searchHistory` を更新しないようにロジックを調整する

## 4. テストと動作確認

- [x] 4.1 タグクリック時に正しく内部検索が起動し、結果が表示されることを確認する
- [x] 4.2 検索結果のヘッダーに正しいタグ名が表示されることを確認する
- [x] 4.3 キーワード検索とタグ検索を交互に行い、表示や履歴が期待通りであることを確認する