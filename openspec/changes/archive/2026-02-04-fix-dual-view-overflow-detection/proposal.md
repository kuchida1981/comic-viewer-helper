## Why

見開き表示で最終ページペアを閲覧しているとき、「次へ」操作でメタデータモーダル（info 画面）が表示されないバグが存在する（issue #99）。
`Navigator.scrollToImage` のオーバーフロー判定が見開き調整の**前**に実行されているため、見開き調整で targetIndex が範囲外になっても検知できない。

## What Changes

- `Navigator.scrollToImage` メソッドにおいて、オーバーフロー判定を見開き調整の**後**に移動する
- クランプ前の targetIndex が `imgs.length` 以上になった場合にモーダル表示と早期リターンを行う

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
<!-- 既存要件の実装バグ修正のみ。要件レベルの変更はない -->

## Impact

- `src/managers/Navigator.js`: `scrollToImage` メソッド（オーバーフロー判定と見開き調整の順序を変更）
- 関連する既存要件: `navigation-control` spec の「最終ページ超過時の Info 画面自動表示」・`dual-page-view` spec の「Navigation Adjustment」