## Context

現在のページ送りは `InputManager` がキーボード・ホイール・GUIボタンのイベントを受け付け、`Navigator.scrollToImage(direction)` へ委譲する。画像のDOM構築は `logic.js` の `fitImagesToViewport()` が行い、見開き時は `.comic-row-wrapper` 内に2枚の画像を `flexDirection: row-reverse` で並べる。`Draggable` はGUIコンテナのみに適用されており、画像自体には適用されていない。

## Goals / Non-Goals

**Goals:**
- 画像クリックで次ページ・前ページに移動できるようにする
- 見開き時は左右の画像で方向を分岐する
- クリック判定とドラッグの混同を防止する

**Non-Goals:**
- アクセシビリティ属性（role/aria）の追加は今スコープ外
- 左開き書籍への対応は将来（#73）に任せる
- 画像自体のドラッグ機能の実装

## Decisions

### 1. イベント処理の場所: InputManager に追加
**決定**: `InputManager` に `onMouseDown` / `onMouseUp` を追加し、既存のイベント処理と同じ場所にまとめる。

**理由**: `InputManager` がすでに全入力イベントの窓口になっている。新しいイベント種別を散らすと変更追跡が難しくなる。

**代替案**: `logic.js` の `fitImagesToViewport` 内で画像ごとに click リスナーを登録 → クリーンアップDOM時にリスナーも削除する必要があり複雑になる。

### 2. クリック判定: mousedown 位置と mouseup 位置の距離で判別
**決定**: `mousedown` で開始位置を記録し、`mouseup` で移動距離を計算。閾値（5px）以内なら「クリック」とする。

**理由**: 単純な `click` イベントでも動作するが、将来的にドラッグが画像に追加された場合に対応しやすい。また mousedown/mouseup のペアで「何のイベントか」を明確にできる。

**閾値 5px の根拠**: モバイルタッチでも「意図のないスライド」を除外できる一般的な値。

### 3. 見開き左右判定: 兄弟画像との DOM順序で判定
**決定**: クリック対象の画像の `parentElement`（`.comic-row-wrapper`）を見て、兄弟画像がある場合は互いの DOM順序と `flexDirection: row-reverse` の組み合わせで「画面上の左右」を判定する。

**判定ロジック**:
```
flexDirection: row-reverse の場合（現在は常にこの設定）
  DOM順序: [img_i, img_i+1]
  画面上:  [img_i+1 (右), img_i (左)]

  → クリック対象が DOM の先頭 (firstChild) = 画面上の右側 = prev (前へ)
  → クリック対象が DOM の後尾 (lastChild) = 画面上の左側 = next (次へ)
```

**理由**: `flexDirection` は将来の左開き対応で変わる可能性があるため、実際の計算済みスタイルを読んで判定すると将来耐性が高い。ただし現時点では `row-reverse` で固定されているため、DOM順序による判定で十分。左開き対応（#73）時に再設計する。

### 4. 見開き表示で画像が1枚だけの場合
**決定**: 兄弟画像がない場合は「単一画像」として扱い、クリック → 次ページとする。

**理由**: `logic.js` で `pairWithNext` が `false` になった画像は `.comic-row-wrapper` に単一で収まるため、「兄弟画像がない」＝単一と判定が自然になる。

### 5. ヘルパー関数の場所: logic.js に追加
**決定**: 見開き左右方向判定のヘルパーを `logic.js` に追加し、単独でテスト可能にする。

**理由**: `logic.js` が既にレイアウト判定のロジックの場所で、ユニットテストが整っている。

## Risks / Trade-offs

- [リスク: イベント対象が画像以外の要素] → `mousedown` で `e.target` が `<img>` であることを確認してスキップする
- [リスク: モーダル表示中のクリック] → モーダルが開いている場合はクリック判定をスキップする（既存のホイール・キーボード処理と同じパターン）
- [リスク: スクリプト無効状態でのクリック] → `enabled` フラグを確認してスキップ