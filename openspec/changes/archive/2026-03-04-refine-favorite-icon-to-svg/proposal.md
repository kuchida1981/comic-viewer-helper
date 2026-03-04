## Why

お気に入りボタンをトグル（♡/♥の切り替え）した際、フォントのレンダリング差異によりUI全体の高さが微妙に変化し、ガタつき（Layout Shift）が発生しています。これを解消し、視覚的な安定性とデザインの一貫性を向上させるために、お気に入りアイコンをSVG化します。

## What Changes

- **お気に入りアイコンのSVG化**: 絵文字（♡/♥）をSVGアイコンに置き換え、サイズ（width, height）を固定します。
- **アイコン管理の共通化**: `src/ui/icons.ts`（新規）または既存のユーティリティを拡張し、一貫したSVGアイコンを提供できるようにします。
- **UIコンポーネントの更新**: `NavigationButtons` および `MetadataModal` でのお気に入りボタンの実装を更新します。
- **スタイリングの調整**: `styles.ts` を修正し、SVGアイコンが適切に配置され、ホバー時などの挙動が安定するようにします。

## Capabilities

### New Capabilities

### Modified Capabilities
- `favorites-management`: お気に入り状態の表示において、フォント依存の記号ではなく、サイズが固定された独自の視覚的表現（SVG）を使用するように要件を更新します。

## Impact

- `src/ui/components/NavigationButtons.ts`
- `src/ui/components/MetadataModal.ts`
- `src/ui/styles.ts`
- `src/ui/icons.ts` (新規作成)
