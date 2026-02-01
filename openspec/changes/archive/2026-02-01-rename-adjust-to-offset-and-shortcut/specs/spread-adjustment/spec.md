## MODIFIED Requirements

### Requirement: Manual Offset Adjustment
システムは、「見開きモード」が有効な場合のみ表示されるユーザーインターフェース（ラベル：`Offset`）を提供し、ユーザーが手動で見開きオフセット（0/1）を切り替えられるようにしなければならない（SHALL）。
このUIには、機能の内容を説明するツールチップ（`Shift spread pairing by 1 page (Offset)`）を設定しなければならない（SHALL）。
また、キーボードの `o` キー押下によっても同様の切り替えが可能でなければならない（SHALL）。
この操作を実行した際、システムは現在の `spreadOffset` 状態を反転（0から1、または1から0）させ、即座にビューを再描画しなければならない（MUST）。

#### Scenario: Adjusting spread alignment via GUI
- **WHEN** ユーザーが見開きモード中に `Offset` ボタンをクリックする
- **AND** 現在のペアリングが [画像N-1, 画像N] (Offset 0) である
- **THEN** システムは `spreadOffset` を 1 に更新する
- **AND** ビューが再描画され、ペアリングが [画像N, 画像N+1] に変更される

#### Scenario: Adjusting spread alignment via Keyboard
- **WHEN** ユーザーが見開きモード中に `o` キーを押下する
- **AND** 現在のペアリングが [画像N-1, 画像N] (Offset 0) である
- **THEN** システムは `spreadOffset` を 1 に更新する
- **AND** ビューが再描画される
