## ADDED Requirements

### Requirement: Autoplay Suspension on Modal Display
システムは、いずれかのモーダル（検索、ヘルプ、または作品情報）が表示されている間、オートプレイのタイマーを一時停止（SHALL）し、モーダルがすべて閉じられた際に、オートプレイが有効なままであれば自動的にタイマーを再開しなければならない（SHALL）。

#### Scenario: モーダル表示によるオートプレイの一時停止
- **WHEN** オートプレイが有効（`isAutoplayEnabled: true`）である
- **AND** ユーザーが検索モーダル、ヘルプモーダル、または作品情報モーダルのいずれかを開く
- **THEN** 実行中のオートプレイタイマーは破棄され、ページ遷移は発生しない
- **AND** `isAutoplayEnabled` の状態（チェックボックス）は `true` のまま維持される

#### Scenario: モーダル閉鎖によるオートプレイの再開
- **WHEN** オートプレイが有効（`isAutoplayEnabled: true`）である
- **AND** 表示されていたすべてのモーダルが閉じられる
- **THEN** システムは自動的にオートプレイタイマーを再設定し、設定された待機時間のカウントを開始する

## MODIFIED Requirements

### Requirement: Autoplay Termination at Last Page
ナビゲーションの結果、最終ページに到達した場合、システムはランダムジャンプ（`lucky-navigation`）を試行しなければならない（SHALL）。ランダムジャンプの候補が存在しない場合に限り、オートプレイのタイマーを停止し、`isAutoplayEnabled` は `false` に変更しなければならない（SHALL）。

#### Scenario: 最終ページ到達時の自動ランダムジャンプ
- **WHEN** オートプレイによる自動遷移の結果、最終ページ（`currentIndex >= imgs.length - 1`）に到達する
- **AND** ランダムジャンプの候補（関連作品または検索キャッシュ）が存在する
- **THEN** システムは `jumpToRandomWork()` を実行し、他の作品へ遷移する
- **AND** この際、`isAutoplayEnabled` は `true` のまま維持される

#### Scenario: ジャンプ候補がない場合のオートプレイ停止
- **WHEN** オートプレイにより最終ページに到達する
- **AND** ランダムジャンプの候補が一つも存在しない
- **THEN** オートプレイのタイマーは解除され、`isAutoplayEnabled` は `false` に変更される
