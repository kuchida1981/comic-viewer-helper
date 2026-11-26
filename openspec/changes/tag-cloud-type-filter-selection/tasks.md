## 1. ロジック（`src/logic.ts`）

- [ ] 1.1 `toggleTagTypeFilter` を `src/logic.ts` に追加する（全選択時は単一選択化、絞り込み中は除外された種類の追加・選択済み種類の除外、最後の1種類は除外不可、元の Set を変更しない）
- [ ] 1.2 `src/logic.test.ts` に `toggleTagTypeFilter` のユニットテスト（全選択からの選択、追加選択、複数選択からの除外、最後の1種類の保護、不変性）を追加し、100% カバレッジを維持する

## 2. i18n とスタイル（`src/i18n.ts`, `src/ui/styles.ts`）

- [ ] 2.1 `src/i18n.ts` にリセットボタン用の翻訳キー `ui.tagTypeReset`（`en`: `'Reset'`, `ja`: `'リセット'`）を追加する
- [ ] 2.2 `src/ui/styles.ts` にリセットボタン（`.comic-helper-tag-type-reset`）および非活性状態（`:disabled`）のスタイルを追加する

## 3. UI（`src/ui/components/FavoritesModal.ts`）

- [ ] 3.1 `FavoritesModal.ts` の `handleToggleType` を `toggleTagTypeFilter` を用いた状態更新に置き換える
- [ ] 3.2 `createTagTypeChips` にリセットボタンを追加し、全選択状態（`excludedTypes.size === 0`）では `disabled` とし、クリック時に全選択へ戻す `handleResetTypes` を接続する
- [ ] 3.3 `src/ui/components/FavoritesModal.test.ts` のタグ種別フィルタテストを更新・追加する（単一選択、追加選択、最後の1種類の保護、リセットボタンの活性/非活性・全選択復帰、既存仕様の維持）

## 4. 検証

- [ ] 4.1 `npm run test`、`npm run lint`、`npm run check-types`、`npm run build` がすべて成功することを確認する
- [ ] 4.2 `npx openspec validate --strict --all` が成功することを確認する
