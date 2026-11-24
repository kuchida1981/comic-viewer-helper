# Proposal

## Why

お気に入り一覧は、保存順（追加した順の昇順）のまま表示されている。新しく追加した作品ほど見返す機会が多いため、新しく追加した作品が先頭に来る降順で表示したい（Issue #275）。

## What Changes

- お気に入り一覧モーダルのグリッドを、追加した順の降順（新しいものが先頭）で表示する。
- 並び替えは表示時のみ行い、保存データ（`state.favorites`）の順序・形式は変更しない。マイグレーションは不要で、Gist 同期（`sync-data-via-gist`）や、`favorites` を参照するランダム選択にも影響しない。
- タグによる絞り込み中も、絞り込み後の一覧を降順で表示する。
- 履歴タブの並び（`SortMode`）は変更しない。昇順/降順の切り替え UI は今回のスコープ外とする。

## Capabilities

### New Capabilities
なし。

### Modified Capabilities
- `favorites-list`: お気に入り一覧の表示順を「追加した順の降順」とする要件を追加する。

## Impact

- `src/ui/components/FavoritesModal.ts`: グリッド描画前に配列を反転する（初期描画・`rerenderFavoritesPanel` の2か所）。
- `src/ui/components/FavoritesModal.test.ts`（または `components.test.ts`）: 表示順のテストを追加する。
- 純粋関数として切り出す場合は `src/logic.ts` に置き、100% カバレッジを維持する。
- 保存形式・`Store`・`SyncManager`・`UIManager` の追加処理は変更しない。
