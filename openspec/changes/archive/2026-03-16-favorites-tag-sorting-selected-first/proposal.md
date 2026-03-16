## Why

お気に入り画面（Library）でのタグ絞り込み時に、現在どのタグが選択されているかを視覚的に分かりやすくし、絞り込みの利便性を向上させるため。タグ件数が多い場合に選択中のタグが埋もれてしまう問題を解消します。

## What Changes

- お気に入り画面のトレンドタグリストにおいて、選択されたタグを常にリストの先頭に移動するように変更します。
- 複数のタグを選択している場合は、それらすべてがリストの先頭に並ぶようにします。
- 選択を解除したタグは、元のソート順（「ピン留め」および「出現頻度」）に基づく位置に戻ります。
- タグ表示制限（デフォルト10件）が適用されている場合でも、選択されたタグが常に表示されるように表示件数を調整します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `favorite-tag-trends`: 選択されたタグを先頭に表示する要件を追加

## Impact

- `src/logic.ts`: `calculateTrends` 関数のソートロジックおよび表示件数調整ロジックの変更。
- `src/ui/components/FavoritesModal.ts`: 選択状態を `calculateTrends` に渡すように変更。
- `src/logic.test.ts` および `src/ui/components/FavoritesModal.test.ts`: 新しい挙動に対応するテストの追加。
