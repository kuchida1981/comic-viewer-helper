## Context

現在、`Navigator.scrollToImage(direction)` は最終ページで「次へ」を押した際に `targetIndex` を `imgs.length - 1` にクランプして何もしない。
`MetadataModal` の表示は `store.setState({ isMetadataModalOpen: true })` で制御され、`UIManager` が購読して DOM に反映する。
`Navigator` は `store` を依存注入で持っており、直接状態を更新できる。

## Goals / Non-Goals

**Goals:**
- `Navigator.scrollToImage(1)` で最終ページを超えた際に `isMetadataModalOpen: true` を store に書き込む
- モーダルが既に開いている場合は何もしない

**Non-Goals:**
- `scrollToImage(-1)` で最初のページを超えた場合の自動表示
- モーダルの内容やデザインの変更
- 「読み完了」画面としての拡張（将来課題）

## Decisions

### Decision 1: キーボード・GUIボタンは `Navigator.scrollToImage()`、ホイールは `InputManager.handleWheel()` で対応

**選択**: キーボード・GUIボタンは `Navigator.scrollToImage()` の境界チェック箇所に条件を追加する。ホイールは `InputManager.handleWheel()` で同様の判定を直接追加する。

**理由**: キーボード・GUIボタンは `scrollToImage` に収束するため、その境界チェックで対応できる。一方、ホイール操作は `handleWheel` 内で自体インデックスを計算して `jumpToPage` を呼び出すため、`scrollToImage` を経由しない。ホイールも同じ判定を行うことで、全エントリポイントで一貫した動作を確保する。

**代替案**: ホイールも `scrollToImage` を経由するように変更する。
→ 採用しない。`handleWheel` にはスロットルやデュアルビュー時の `step` による独自のインデックス計算があり、呼び出し構造を変えるのは別の変更になる。

### Decision 2: モーダル開く条件チェックは `store.getState()` で現在の表示状態を確認

**選択**: `scrollToImage` 内で `this.store.getState().isMetadataModalOpen` を読んで、`false` の場合のみ `setState` する。

**理由**: 既に開いている場合は再書き込みすることで不要な再レンダリングが発生し、モーダルの操作中に割り込むような UX になる。読み取り→条件付き書き込みが最も自然で軽量。

### Decision 3: ホイールナビゲーションも対象とする

**選択**: `InputManager.handleWheel()` で、最終ページで下スクロールした場合に `isMetadataModalOpen: true` をセットする。

**理由**: キーボード・GUIボタンで最終ページの次へ操作で info が表示されるのに、ホイールでは表示されないのは一貫性がない。`handleWheel` は `scrollToImage` を経由しないため、同様の判定を直接 `handleWheel` に追加した。

## Risks / Trade-offs

- **[リスク] `scrollToImage` は `async` メソッド。画像ロード待機中にモーダルが開く。**
  → Mitigation: モーダル開く判定は `targetIndex` が境界を超えた瞬間（ロード待機前）に行う。ロード待機は既に超えた場合には発生しないため実質的にリスクは低い。

- **[トレードオフ] ホイールの判定は `handleWheel` に分散した。**
  → キーボード・GUIボタンと同じ判定ロジックを二箇所に持つが、`handleWheel` の呼び出し構造を変えるほうがコスト高のため、現時点では許容する。
