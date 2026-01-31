## Context

リレイアウト処理 (`fitImagesToViewport`) は `cleanupDOM` を介して既存の DOM 要素を一度削除し、再度追加するため、ブラウザの自然なスクロール位置保持機能が働かない。

## Goals / Non-Goals

**Goals:**
- ウィンドウリサイズ前後で、見ていた画像が引き続き中央に表示されること。
- 画像が非同期に読み込まれた際のリレイアウトでも位置を維持すること。

**Non-Goals:**
- スクロールのピクセル単位での完全な一致（画像単位での中央表示を目標とする）。

## Decisions

- **Decision 1: `getPrimaryVisibleImageIndex` の活用**
    - リレイアウトの直前に現在最も大きく表示されている画像のインデックスを取得し、再配置後にそのインデックスの画像へ `scrollIntoView({ block: 'center' })` を行う。
- **Decision 2: リレイアウト処理の統合**
    - `resize` イベントや `load` イベントで重複しているリレイアウトロジックを整理し、一貫して「位置保存 → 再配置 → 位置復元」が行われるようにする。

## Risks / Trade-offs

- **[Risk] リサイズ中に何度も `scrollIntoView` が呼ばれることによるガタつき**
    - → [Mitigation] 既存の `requestAnimationFrame` によるデバウンス処理を継続利用し、最終的な描画タイミングで一度だけ実行する。
