## Context
リサイズイベントは高頻度で発生し、そのたびに `applyLayout` が呼ばれる。`fitImagesToViewport` はDOM構造を一度壊して再構築するため、その直後に `updatePageCounter` を呼ぶと、一時的な（誤った）スクロール位置に基づいてページ番号が上書きされてしまう。

## Goals / Non-Goals

**Goals:**
- リサイズ操作中にページ番号が勝手に変わる（ドリフトする）現象を完全に解消する。
- レイアウト変更後、常にリサイズ前のページが中央に来るようにする。

**Non-Goals:**
- `applyLayout` のパフォーマンス（処理速度）自体の改善（今回は正当性の確保が主眼）。

## Decisions

1. **`applyLayout` 内での `updatePageCounter` 呼び出しを削除**
   - **Rationale**: `applyLayout` は「現在のインデックスを維持しながら配置を整える」ことに専念させるべき。インデックスの更新は、ユーザーが能動的にスクロールした結果として発生するイベント（`handleScroll`）に任せるのが責務分担として正しい。
   - **Alternatives**: `updatePageCounter` 内でフラグによるガードを行う案もあったが、メソッドの責務が複雑になるため、呼び出し元で制御する方がシンプル。

2. **`requestAnimationFrame` による順序制御**
   - **Rationale**: DOM更新直後の `scrollIntoView` は、ブラウザのレイアウト計算が追いついていない可能性があるため、`requestAnimationFrame` で次フレームに実行することで確実性を高める。

## Risks / Trade-offs

- **[Risk]** `applyLayout` 後にページ番号が更新されなくなるため、もし `scrollIntoView` が失敗すると、表示とデータが食い違う可能性がある。
  - **Mitigation**: `scrollIntoView` は信頼性が高いため問題ないはずだが、念のため `scroll` イベント側では引き続き `updatePageCounter` が動いているため、ユーザーが少しでもスクロールすれば補正される。

## Migration Plan
- 既存の動作を変更するのみで、データ移行などは不要。
