## 1. データ構造とStoreの準備

- [ ] 1.1 `src/types.ts` に `HistoryEntry` インターフェースを追加する
- [ ] 1.2 `src/store.ts` の `StoreState` と `STORAGE_KEYS` を更新し、`luckyHistory` の型を変更する
- [ ] 1.3 `src/store.ts` に既存の `string[]` 形式の履歴を `HistoryEntry[]` に変換するマイグレーションロジックを追加する
- [ ] 1.4 `src/store.ts` の `addLuckyHistory` を、`RelatedWork` を受け取り詳細な統計を更新するロジックに修正する（24時間ルールを含む）

## 2. ライブラリUIの拡張

- [ ] 2.1 `src/i18n.ts` に必要な翻訳文字列（履歴、ソート順、閲覧回数表示など）を追加する
- [ ] 2.2 `src/ui/styles.ts` にタブUIやソートメニュー用のスタイルを追加する
- [ ] 2.3 `src/ui/components/FavoritesModal.ts` を `LibraryModal` として動作するように拡張し、タブ切り替え状態を追加する
- [ ] 2.4 `src/ui/components/FavoritesModal.ts` にソート機能（閲覧数、日時）を実装する
- [ ] 2.5 `src/ui/components/FavoritesModal.ts` の各アイテムにお気に入りトグルボタンと削除ボタンを追加する

## 3. ロジックの統合と調整

- [ ] 3.1 `src/managers/UIManager.ts` を更新し、モーダルへの履歴データ受け渡しと操作イベントのハンドリングを追加する
- [ ] 3.2 `src/main.ts` の作品読み込み時の処理を更新し、タイトルやサムネイルを含む詳細な作品情報を履歴に保存するようにする
- [ ] 3.3 `src/managers/DiscoveryManager.ts` の「おすすめ（ランダム）」機能が、新しい履歴データ構造でも正しく動作することを確認・修正する

## 4. テストと検証

- [ ] 4.1 `src/store.test.ts` に新しい履歴保存ロジック（24時間重複排除など）のテストを追加する
- [ ] 4.2 `src/ui/components/FavoritesModal.test.ts` を更新し、タブ切り替えやソート機能のテストを追加する
- [ ] 4.3 全体の動作確認を行い、`localStorage` への保存と復元が正しく行われることを確認する
