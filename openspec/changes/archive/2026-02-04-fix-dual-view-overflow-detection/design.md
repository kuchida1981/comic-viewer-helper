## Context

`Navigator.scrollToImage` では以下の順序で処理を行っている：

1. `targetIndex = currentIndex + direction`
2. オーバーフロー判定 (`targetIndex >= imgs.length` → モーダル表示＋早期リターン)
3. 見開き調整 (`targetIndex += direction`, 同一 comic-row-wrapper の場合)
4. クランプ (`finalIndex = Math.min(targetIndex, imgs.length - 1)`)

見開き表示で最後のペア (N-2, N-1) の primary が N-2 の場合、`direction=+1` で targetIndex は N-1 となり、ステップ2のオーバーフロー判定をくぐる。その後、ステップ3で同一ペア内なので `targetIndex += 1 → N` となり範囲外になるが、ステップ4のクランプで N-1 に戻り移動先が現在位置のままとなる。モーダルは開かない。

一方、`InputManager.handleWheel` は `step = isDualViewEnabled ? 2 : 1` で事前に見開き分を含めたオーバーフロー判定を行い、正しく動作している。

## Goals / Non-Goals

**Goals:**
- 見開き表示で最終ページペアの「次へ」操作でメタデータモーダルが正しく表示されるようにする
- `scrollToImage` のオーバーフロー判定と見開き調整の順序を修正する

**Non-Goals:**
- `handleWheel` の実装には手を加えない（既に正しく動作している）
- オーバーフロー以外の見開きナビゲーション挙動の変更

## Decisions

### オーバーフロー判定を見開き調整の後に移動する

見開き調整ブロック（lines 153-158）の直後に、クランプの前にオーバーフロー判定を配置する。

```
  targetIndex = currentIndex + direction

  if (targetIndex < 0) targetIndex = 0;

  // 見開き調整
  if (isDualViewEnabled && direction !== 0 && currentIndex !== -1) {
    ...
    if (同一ペア) targetIndex += direction;
  }

  // オーバーフロー判定（移動後）
  if (targetIndex >= imgs.length) {
    if (direction > 0 && !isMetadataModalOpen) {
      setState({ isMetadataModalOpen: true });
    }
    return;
  }

  // クランプ
  const finalIndex = Math.max(0, Math.min(targetIndex, imgs.length - 1));
```

**代替案: 判定値を 2 単位にする (`handleWheel` と同じアプローチ)**
- `targetIndex + (isDualView && 同一ペア ? 1 : 0) >= imgs.length` で判定する
- `handleWheel` と一貫性があるが、「同一ペアか」の判定が判定式に入り、オーバーフロー判定のコード自体が複雑になる
- 判定を移動する方が、フローの読みやすさと維持性が高い

## Risks / Trade-offs

- [リスク] 見開き調整で `targetIndex` が負になる場合 → `targetIndex < 0` の下限チェックは見開き調整の前に残すため、負になるのは `direction=-1` で同一ペア内の場合のみ。この場合オーバーフロー判定 (`>= length`) は発火しないため問題ない。
- [リスク] 単一画像表示での動作の変更 → 見開き調整ブロックは `isDualViewEnabled` で guards されているため、単一画像の場合はブロックをくぐらず、判定順序の変更に実質的な影響はない。