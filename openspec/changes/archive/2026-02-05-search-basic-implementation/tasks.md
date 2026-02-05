## 1. 型定義とストアの拡張

- [x] 1.1 `src/types.ts` に `SearchConfig` インターフェースを追加し、`SiteAdapter` を拡張する
- [x] 1.2 `src/store.ts` の `StoreState` に `isSearchModalOpen` を追加する

## 2. i18n と スタイル

- [x] 2.1 `src/i18n.ts` に検索モーダル用の翻訳文字列（タイトル、プレースホルダ等）を追加する
- [x] 2.2 `src/ui/styles.ts` に検索モーダルと入力フィールド用のスタイルを追加する

## 3. UIコンポーネントの実装

- [x] 3.1 `src/ui/components/SearchModal.ts` を新設し、モーダルUIを実装する
- [x] 3.2 検索アイコンを `src/ui/components/NavigationButtons.ts` に追加する

## 4. 統合とリダイレクトロジック

- [x] 4.1 `src/managers/UIManager.ts` を更新し、検索ボタンのクリックハンドリングとモーダルの表示制御を実装する
- [x] 4.2 `src/adapters/DefaultAdapter.ts` にデフォルトの `searchConfig` と `getSearchUrl` を実装する

## 5. テストと検証

- [x] 5.1 `DefaultAdapter.getSearchUrl` の動作を確認するためのユニットテストを追加する
- [x] 5.2 実際に検索キーワードを入力してサイトの検索ページにリダイレクトされることを確認する