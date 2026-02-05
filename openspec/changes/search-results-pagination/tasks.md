## 1. データモデルと型の定義

- [ ] 1.1 `src/types.ts`: `PaginationItem` インターフェースを追加する
- [ ] 1.2 `src/types.ts`: `SearchResultsState` に `pagination: PaginationItem[]` プロパティを追加する

## 2. アダプターの拡張 (パースロジック)

- [ ] 2.1 `src/adapters/DefaultAdapter.ts`: `parseSearchResults` メソッドを拡張し、`div.wp-pagenavi` からページ情報を抽出するロジックを実装する
- [ ] 2.2 抽出した情報を `PaginationItem[]` 形式に変換して戻り値に含める
- [ ] 2.3 `src/adapters/DefaultAdapter.test.ts`: 新しいパースロジックに対応したテストケースを追加し、正常にページ情報が抽出できることを確認する

## 3. UI コンポーネントの刷新

- [ ] 3.1 `src/ui/components/SearchModal.ts`: `SearchModalProps` に `onPageChange: (url: string) => void` を追加する
- [ ] 3.2 `src/ui/components/SearchModal.ts`: `createResultsSection` 内で、`searchResults.pagination` に基づいてページングボタン群をレンダリングするロジックを追加する
- [ ] 3.3 ページングボタンのデザインを `src/ui/styles.ts` に追加する（`.comic-helper-search-pagination` 等）
- [ ] 3.4 ページングボタンをクリックした際に、`onPageChange` が呼び出されるようにイベントハンドラを設定する

## 4. 管理ロジックの実装

- [ ] 4.1 `src/managers/UIManager.ts`: `performSearch` メソッドをキーワードまたは URL を受け取れるようにリファクタリングする
- [ ] 4.2 `src/managers/UIManager.ts`: `SearchModal` 作成時に `onPageChange` コールバックを渡し、指定された URL で `performSearch` を実行するように構成する
- [ ] 4.3 ページ遷移中も `setUpdating(true)` を呼び出し、SWR パターンと整合性が取れるように調整する

## 5. 動作確認と最終調整

- [ ] 5.1 モーダル内でのページ遷移が正常に動作し、グリッドが更新されることを確認する
- [ ] 5.2 ページ遷移後も検索キーワードが入力フィールドに残っていることを確認する
- [ ] 5.3 存在しないページやエラー時のハンドリングが適切であることを確認する
