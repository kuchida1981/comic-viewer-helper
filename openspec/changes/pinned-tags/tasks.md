## 1. 基礎（Store & Logic）の更新

- [ ] 1.1 `src/store.ts` に `pinnedTags` を追加し、ホストごとの永続化（`GM_getValue`/`GM_setValue`）を実装
- [ ] 1.2 `src/store.ts` に `togglePinnedTag(tagText: string)` メソッドを追加
- [ ] 1.3 `src/logic.ts` の `calculateTrends` を更新し、ピン留めされたタグを最優先で表示するようにソートロジックを変更
- [ ] 1.4 `src/logic.test.ts` にピン留めを考慮した `calculateTrends` のテストケースを追加

## 2. UI（アイコンと翻訳）の追加

- [ ] 2.1 `src/ui/icons.ts` にピン留め用（塗りつぶし・枠線）の SVG アイコンを追加
- [ ] 2.2 `src/i18n.ts` にピン留め機能に関連する翻訳（`ui.pinTag`, `ui.unpinTag`）を追加
- [ ] 2.3 `src/ui/styles.ts` にタグピン留め用のスタイル（コンテナ、ピンボタン、アクティブ状態）を追加

## 3. UI（モーダル）の実装

- [ ] 3.1 `src/ui/components/FavoritesModal.ts` の `FavoritesModalProps` に `pinnedTags` と `onTogglePinTag` を追加
- [ ] 3.2 `src/ui/components/FavoritesModal.ts` のタグチップ生成部分をコンテナ化し、ピン留めボタンを追加するようリファクタリング
- [ ] 3.3 `src/main.ts` で `Store` から `pinnedTags` を取得し、`FavoritesModal` に渡すように更新

## 4. 最終確認

- [ ] 4.1 全テストを実行し、リグレッションがないことを確認 (`npm run test`)
- [ ] 4.2 ビルドと型チェックを実行 (`npm run build`, `npm run check-types`)
- [ ] 4.3 OpenSpec の整合性チェックを実行 (`npx openspec validate`)
