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

### Decision 1: 変更箇所は `Navigator.scrollToImage()` のみ

**選択**: `Navigator.scrollToImage()` 内の境界チェック箇所に条件を追加する。

**理由**: 「次へ」の全エントリポイント（キーボード・GUIボタン・ホイール）は最終的にこのメソッドに収束する。ここに一箇所だけ変更すれば全経路に対応できる。`InputManager` や各ボタンコールバックに個別に判定を追加する必要がない。

**代替案**: `InputManager.onKeyDown()` やボタンコールバックの各箇所に判定を追加する。
→ 採用しない。最終ページの判定ロジックが分散し、漏れのリスクが高い。

### Decision 2: モーダル開く条件チェックは `store.getState()` で現在の表示状態を確認

**選択**: `scrollToImage` 内で `this.store.getState().isMetadataModalOpen` を読んで、`false` の場合のみ `setState` する。

**理由**: 既に開いている場合は再書き込みすることで不要な再レンダリングが発生し、モーダルの操作中に割り込むような UX になる。読み取り→条件付き書き込みが最も自然で軽量。

### Decision 3: ホイールナビゲーションの扱い

**選択**: `InputManager.handleWheel()` は現在インデックスを `Math.min(..., imgs.length - 1)` で自体でクランプしており、`scrollToImage` を呼んでいない。ホイールによる最終ページ超過時の自動表示は本イシューの対象としない。

**理由**: イシュー #88 の要件は「`j` キー / `PageDown` / ナビゲーションボタン」を明示しており、ホイールは言及しない。別途検討の余地を残す。

## Risks / Trade-offs

- **[リスク] `scrollToImage` は `async` メソッド。画像ロード待機中にモーダルが開く。**
  → Mitigation: モーダル開く判定は `targetIndex` が境界を超えた瞬間（ロード待機前）に行う。ロード待機は既に超えた場合には発生しないため実質的にリスクは低い。

- **[トレードオフ] ホイールナビゲーションは本次対象外。**
  → ホイールのクランプ処理は `handleWheel` にある。将来対応する場合は別イシューで。
