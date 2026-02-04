## Context

`Navigator.js` には3つのナビゲーションメソッドがある。いずれも移動先画像が未ロードの場合（not-loaded パス）と既にロード済みの場合（loaded パス）で処理を分岐している。`pendingTargetIndex` は、画像の `load` イベントによる自動 `applyLayout` を抑制するガードで、ナビゲーション実行中に割り込みを防止する。

#91 で `scrollToEdge` の loaded パスで同じ問題が発現し、`applyLayout(index)` を経由し RAF 内で `pendingTargetIndex` を解除するパターンに修正された。`jumpToPage` と `scrollToImage` の loaded パスは同じ問題を持っているが未修正のまま残っている。

## Goals / Non-Goals

**Goals:**
- `jumpToPage` と `scrollToImage` の loaded パスで、`pendingTargetIndex` の解除タイミングを修正し、`scrollToEdge` と同じレベルの割り込み防止を達成する
- `jumpToPage`（ページジャンプ・resume）は瞬間移動とする
- `scrollToImage`（j/k キーによるページスクロール）はスムーズスクロールを維持する

**Non-Goals:**
- smooth スクロール途中の割り込みを完全に防止する（現イシュールスコープの外）
- `applyLayout` のインターフェース変更やナビゲーションメソッドの統一リファクタリング

## Decisions

### Decision 1: jumpToPage の loaded パスは applyLayout を経由する

`scrollToEdge` と同じパターンに統一する。`applyLayout(index)` が RAF 内で `scrollIntoView` を実行し、ガード解除も RAF で行う。

```
// jumpToPage loaded パス（修正後）
this.applyLayout(index);
requestAnimationFrame(() => {
  this.pendingTargetIndex = null;
});
return true;
```

**背景**: ページジャンプは瞬間移動が望ましい。`applyLayout` 経由がfit で既に実績がある（scrollToEdge、not-loaded パス）。

**検討した代替**: RAF 遅延のみで `scrollIntoView({ behavior: 'smooth' })` を維持。→ ページジャンプで smooth スクロールは不適切なため採用しない。

### Decision 2: scrollToImage の loaded パスは scrollIntoView を維持し、解除だけを RAF に遅延

ページスクロールの UX としてスムーズスクロールは自然であり維持する。変更は `pendingTargetIndex = null` の位置だけ。

```
// scrollToImage loaded パス（修正後）
finalTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
requestAnimationFrame(() => {
  this.pendingTargetIndex = null;
});
return; // 後ろの pendingTargetIndex = null は削除
```

**背景**: `applyLayout` 経由にすると smooth スクロールが消える。RAF 遅延だけで `scrollToEdge` と同じレベルの割り込み防止が達成される。

**検討した代替**: `applyLayout` に `behavior` オプションを追加して smooth スクロールを経由させる。→ `applyLayout` のインターフェース変更になり、`scrollToEdge` にも影響が出る。Non-Goals に含まれる。

## Risks / Trade-offs

- [Risk] RAF 1回の遅延で smooth スクロール途中の割り込みは理論的に残る → `scrollToImage` の対象は近隣ページの移動で長距離スクロールにはならないため、実質的なリスクは極低い
- [Trade-off] `jumpToPage` の loaded パスが瞬間移動に変わる → ページジャンプとしてこちらの方が自然