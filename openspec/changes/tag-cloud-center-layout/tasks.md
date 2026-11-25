## 1. ロジック（`src/logic.ts`）

- [ ] 1.1 件数降順（同数は文字列昇順）で順位付けし、中央から外側へ並べ替える `arrangeTagCloud` を追加する
- [ ] 1.2 `logic.test.ts` に 0件・1件・偶数件・奇数件・同数のタイブレーク・入力配列を変更しないことのテストを追加し、100% カバレッジを維持する

## 2. UI（`src/ui/components/FavoritesModal.ts`）

- [ ] 2.1 `createTagCloudSection` の文字列昇順ソートを `arrangeTagCloud` に置き換える
- [ ] 2.2 `FavoritesModal.test.ts` の既存の並び順のテストを更新し、中央配置・種類フィルタ後・同数タグのテストを追加する

## 3. 検証

- [ ] 3.1 `make all` が成功することを確認する
- [ ] 3.2 `openspec validate --strict --all` が成功することを確認する
