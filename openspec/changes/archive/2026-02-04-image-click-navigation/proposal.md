## Why

現在のページ送りは「キーボード」「マウスホイール」「GUIボタン」の3種類のみに対応している。画像そのものをクリックで操作できるようにすると、直感的かつタッチ操作にも近い素早いナビゲーションが可能になる（イシュー #89）。

## What Changes

- **新機能**: 画像クリックによるページ送り（次ページ・前ページ）を追加
- 単一画像表示時: クリック → 次ページ
- 見開き表示時（右開き）: 左側画像クリック → 次ページ、右側画像クリック → 前ページ
- 見開き表示で画像が1枚だけの場合: クリック → 次ページ（単一画像と同一挙動）
- **新ヘルパー関数**: `logic.js` に見開き左右の方向判定関数を追加
- クリック判定はmousedown/mouseupの移動距離で行い、将来的なドラッグ操作との衝突を回避する

## Capabilities

### New Capabilities
- `image-click-navigation`: 画像クリックによるページ送り機能の要件

### Modified Capabilities
<!-- 既存のspec-レベルの要件変更はない -->

## Impact

- `src/managers/InputManager.js`: mousedown / mouseup イベントハンドラの追加
- `src/logic.js`: 見開き左右方向判定ヘルパー関数の追加
- `tests/logic.test.js`: 新ヘルパー関数のユニットテスト追加
- 既存の `navigation-control` や `mouse-wheel-navigation` の動作には影響しない