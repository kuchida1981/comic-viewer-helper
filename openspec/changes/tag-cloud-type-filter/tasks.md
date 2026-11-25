## 1. ロジック（`src/logic.ts`）

- [ ] 1.1 `calculateTrends` に `excludedTypes` 引数を追加し、除外種類のタグをソート・件数制限の前に取り除く
- [ ] 1.2 お気に入りに存在するタグの種類を重複なく返す `getTagTypes` を追加する
- [ ] 1.3 `logic.test.ts` に除外・件数制限・`null` 種類・`getTagTypes` のテストを追加し、100% カバレッジを維持する

## 2. UI（`src/ui/components/FavoritesModal.ts`）

- [ ] 2.1 `excludedTypes` のローカル状態を追加する（モーダルを閉じるとリセットされる）
- [ ] 2.2 `createTagCloudSection` に種類別トグルチップ行を追加する（種類が2つ未満のときは非表示。全除外でもチップは維持する）
- [ ] 2.3 チップのクリックでタグクラウドビューのみ再描画する

## 3. スタイル・文言

- [ ] 3.1 `styles.ts` に種類チップ（有効・無効状態）のスタイルを追加する
- [ ] 3.2 `i18n.ts` に「その他」の文言を追加する（日本語・英語）

## 4. テスト・検証

- [ ] 4.1 `FavoritesModal.test.ts` に種類フィルタのUIテストを追加する
- [ ] 4.2 `make all` が成功することを確認する
- [ ] 4.3 `openspec validate --strict --all` が成功することを確認する
