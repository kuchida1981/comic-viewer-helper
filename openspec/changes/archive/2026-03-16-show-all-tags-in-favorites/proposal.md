## Why

現在のお気に入り一覧（Library）の「あなたの好み（Trends）」セクションに表示されるタグは出現回数の上位10件に制限されており、それ以外のタグで絞り込みたい場合に表示・選択する手段がありません。タグを全件表示可能にすることで、特定のタグによるお気に入りのフィルタリングを容易にし、ライブラリの利便性を向上させます。

## What Changes

- `src/logic.ts` の `calculateTrends` を修正し、表示件数の制限をパラメータ化して全件取得を可能にする（デフォルトは上位10件を維持）。
- `src/ui/components/FavoritesModal.ts` に、全件表示と上位表示を切り替えるトグルボタンを UI に追加する。
- `FavoritesModal` 内に `showAllTags` 状態を追加し、ボタン操作に応じてトレンドセクションを動的に更新する。
- 関連する UI テキストの多言語対応（`i18n.ts`）。

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
- `favorites-management`: トレンドタグの表示制限を解除し、全件表示を切り替える要件を追加。

## Impact

- `src/logic.ts`: `calculateTrends` 関数のシグネチャ変更。
- `src/ui/components/FavoritesModal.ts`: UI コンポーネントの状態管理と描画ロジックの変更。
- `src/i18n.ts`: `ui.showAllTags`, `ui.showTopTags` 等の新しい定数の追加。
- `src/logic.test.ts` および `src/ui/components/FavoritesModal.test.ts`: 新機能の検証用テストの追加。
