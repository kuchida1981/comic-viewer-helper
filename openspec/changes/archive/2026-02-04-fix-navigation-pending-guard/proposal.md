## Why

`jumpToPage` と `scrollToImage` の loaded パス（移動先画像が既に読み込み済みの場合）で、`pendingTargetIndex` が `scrollIntoView` の直後に `null` に解除される。`scrollIntoView({ behavior: 'smooth' })` は非同期であるため、スクロール完了前にガードが解除され、途中で読み込まれる画像の `load` イベントが割り込み `applyLayout` を呼び出す可能性がある。`scrollToEdge` で同じ問題が #91 で修正されたが、`jumpToPage` と `scrollToImage` には適用されていない。現時点では発現しにくい潜在バグだが、理論的には同一の問題を持っている。

## What Changes

- `jumpToPage` の loaded パス: `scrollIntoView` を `applyLayout(index)` に切り替え、`pendingTargetIndex` の解除を RAF に遅延させる。これにより瞬間移動かつ割り込み防止になる。
- `scrollToImage` の loaded パス: `scrollIntoView({ behavior: 'smooth' })` を維持し、`pendingTargetIndex` の解除だけを RAF に遅延させる。スムーズスクロールの UX を保ちつつ割り込みを防止する。

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
<!-- なし。潜在バグの修正であり、spec レベルの要件には変化しない。 -->

## Impact

- `src/managers/Navigator.js`: `jumpToPage` と `scrollToImage` の loaded パス（各1箇所）
- 関連イシュー: #93
- 関連修正: #91（`scrollToEdge` での同一問題の修正）