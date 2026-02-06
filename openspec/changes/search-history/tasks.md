## 1. 状態管理の拡張 (Store)

- [x] 1.1 `src/store.ts` に `MAX_SEARCH_HISTORY` 定数と `STORAGE_KEYS.SEARCH_HISTORY` を追加
- [x] 1.2 `StoreState` インターフェースに `searchHistory: string[]` を追加
- [x] 1.3 `Store` クラスの初期化（`constructor`）に `searchHistory` のロード処理を追加
- [x] 1.4 `Store.setState` 内で `searchHistory` の変更を `localStorage` に保存する処理を追加

## 2. 検索ロジックの更新 (UIManager)

- [x] 2.1 `src/managers/UIManager.ts` にクエリ正規化関数 `normalizeQuery` を実装
- [x] 2.2 `UIManager._performSearch` 内で履歴を更新するプライベートメソッド `_updateSearchHistory` を実装
- [x] 2.3 検索実行（URL ではないクエリ指定時）に `_updateSearchHistory` を呼び出すよう修正

## 3. UI の実装 (SearchModal & Styles)

- [x] 3.1 `src/ui/components/SearchModal.ts` の `SearchModalProps` に `searchHistory` を追加
- [x] 3.2 履歴を表示する UI コンポーネント（履歴ボタンのリスト）を実装
- [x] 3.3 履歴ボタンクリック時に `onSearch` を呼び出すイベントハンドラを追加
- [x] 3.4 `src/ui/styles.ts` に履歴表示用のスタイルを追加
- [x] 3.5 `src/managers/UIManager.ts` の `SearchModal` 作成時にストアから `searchHistory` を渡すよう修正

## 4. 多言語対応とテスト

- [x] 4.1 `src/i18n.ts` に `ui.recentSearches` (最近の検索) を追加
- [x] 4.2 重複排除と履歴制限のロジックが期待通り動作するか、テスト（既存の `SearchModal.test.ts` や `store.test.ts` への追加）で確認
