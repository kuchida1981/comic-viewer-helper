## Why

「最初に戻る」「最後に進む」ボタンをクリックした際、対象の画像が `loading="lazy"` などで未ロード状態だと、スクロール位置の計算が正しく行われず、目的の場所まで到達できない問題を解決します。

## What Changes

- `Navigator.scrollToEdge` メソッドの非同期化
- 移動先画像のロード強制と完了待機ロジックの追加
- 画像ロード後のレイアウト再適用とスクロール実行の統合

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `navigation-control`: 「最初に戻る」「最後に進む」操作における画像ロード待機とレイアウト維持の要件を明確化します。

## Impact

- `src/managers/Navigator.js`: `scrollToEdge` の実装変更
- `src/managers/Navigator.test.js`: 非同期動作に対応したテストケースの追加
