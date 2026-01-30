## Context

スクリプトがDOMを直接操作（見開きのラッパー作成など）しているため、単にCSSを外すだけでは元の状態に戻りません。

## Goals / Non-Goals

**Goals:**
- 一時的な無効化時に、視覚的にも機能的にも「スクリプトなし」の状態を再現する。
- 再有効化を容易にするため、最小限のUIを維持する。

**Non-Goals:**
- Tampermonkey自体の「スクリプト無効化」ボタンの代わり（プロセスの完全停止）ではなく、あくまで適用効果のON/OFF。

## Decisions

### 1. 状態の永続化
- **理由**: ユーザーが一度OFFにしたら、他のページでもOFFのままであってほしいため。
- **キー**: `comic-viewer-helper-enabled` (default: `true`)。

### 2. クリーンアップロジック (Revert)
- **DOM**: 見開き用の `.comic-row-wrapper` を削除。
- **配置**: `originalImages` 配列に保持している `img` 要素を、元のコンテナに `appendChild` し直すことで順番と親要素を復元。
- **スタイル**: `img.style.cssText = ''` および `container.style.cssText = ''` でインラインスタイルを全消去。

### 3. UIの最小化状態
- OFF時はボタン（⚡または⚙️）1つのみを表示。
- 通常のドラッグ位置情報を流用し、邪魔にならない位置に配置。

## Risks / Trade-offs

- **[Risk]**: 他のユーザースクリプトやサイト側の動的更新との競合。
  - **Mitigation**: 復元時に `appendChild` を使用することで、元の要素自体を破壊せずに再配置する。
- **[Trade-off]**: 完全な「停止」ではないため、わずかにメモリを消費し続ける。
  - **Rationale**: 再有効化を即座に行うための最小限のオーバーヘッドとして許容する。
