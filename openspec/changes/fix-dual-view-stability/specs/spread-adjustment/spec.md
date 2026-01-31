## ADDED Requirements

### Requirement: Manual Offset Adjustment
システムは、「見開きモード」が有効な場合のみ表示されるユーザーインターフェース（例：「Adjust」ボタン）を提供し、ユーザーが手動で見開きオフセット（0/1）を切り替えられるようにしなければならない（SHALL）。
この操作を実行した際、システムは現在の `spreadOffset` 状態を反転（0から1、または1から0）させ、即座にビューを再描画しなければならない（MUST）。

#### Scenario: Adjusting spread alignment
- **WHEN** ユーザーが見開きモード中に「Adjust」ボタンをクリックする
- **AND** 現在のペアリングが [画像N-1, 画像N] (Offset 0) である
- **THEN** システムは `spreadOffset` を 1 に更新する
- **AND** ビューが再描画され、ペアリングが [画像N, 画像N+1] （または同様のシフト）に変更される

#### Scenario: Adjustment availability
- **WHEN** 見開きモードが無効（単一ページモード）である
- **THEN** 「Adjust」ボタンは非表示または無効化される

### Requirement: Offset Consistency
見開きモードが有効である間、`spreadOffset` の状態はブラウジングセッション中のメモリ内で維持されなければならない（SHALL）。ページ移動（次へ/前へ）を行っても、手動調整されたオフセットがリセットされたり変更されたりしてはならない（MUST）。

#### Scenario: Navigating after adjustment
- **WHEN** ユーザーがオフセットを 1 に調整する
- **AND** ユーザーが次のページペアへ移動する
- **THEN** 新しいページも同じオフセット (1) を使用して描画される