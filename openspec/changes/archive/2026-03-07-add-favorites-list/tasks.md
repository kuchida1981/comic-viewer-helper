## 1. 基礎定義と状態管理の拡張

- [x] 1.1 `src/store.ts` の `StoreState` に `isFavoritesModalOpen: boolean` を追加し、初期値を `false` に設定する
- [x] 1.2 `src/i18n.ts` に「お気に入り一覧」に関連する翻訳テキスト（UIラベル、ショートカット説明など）を追加する
- [x] 1.3 `src/shortcuts.ts` に `favoritesList` ショートカット（キー: `l`）を定義する

## 2. UIコンポーネントの実装

- [x] 2.1 `src/ui/components/FavoritesModal.ts` を新規作成し、`SearchModal.ts` を参考にグリッド表示を実装する
- [x] 2.2 `FavoritesModal.ts` に、各作品タイルの削除ボタン（×）と遷移ロジックを実装する
- [x] 2.3 `src/ui/components/NavigationButtons.ts` に、お気に入り一覧を開くためのボタン（📚）を追加する

## 3. ロジックの統合と制御

- [x] 3.1 `src/managers/UIManager.ts` に `isFavoritesModalOpen` を監視し、`FavoritesModal` を表示・非表示にするロジックを追加する
- [x] 3.2 `src/managers/InputManager.ts`（または相当箇所）で、ショートカット `l` によるトグル処理を実装する
- [x] 3.3 ナビゲーションボタンのクリックイベントを `UIManager` 経由で `Store` の状態更新に繋げる

## 4. 検証とテスト

- [x] 4.1 `src/ui/components/FavoritesModal.test.ts` を作成し、レンダリングとインタラクションのテストを行う
- [x] 4.2 全体の動作確認：ボタン、ショートカットでお気に入り一覧が開閉すること、遷移と削除が正しく機能することを確認する
- [x] 4.3 `npm run lint`, `npm run check-types`, `npm run test` を実行し、既存機能に影響がないことを確認する
