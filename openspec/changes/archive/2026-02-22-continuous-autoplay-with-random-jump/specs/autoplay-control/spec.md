## MODIFIED Requirements

### Requirement: Autoplay Execution
システムは、オートプレイが有効な場合、設定された待機時間ごとに自動的に「次へ」のナビゲーション（`scrollToImage(1)`）を実行しなければならない（SHALL）。
**変更点**: ページロード時（初期化時）にオートプレイが有効な場合、自動的にタイマーを開始する要件を追加。

#### Scenario: 自動ページ送り
- **WHEN** オートプレイが有効（`isAutoplayEnabled: true`）である
- **AND** 設定された待機時間（`autoplayInterval`）が経過する
- **THEN** 自動的に `scrollToImage(1)` が呼び出され、次の画像へスクロールする

#### Scenario: ページロード時のオートプレイ自動開始
- **WHEN** ユーザーが新しいページをロードする
- **AND** ストアの `isAutoplayEnabled` が `true` である
- **THEN** ユーザーの操作を待たずに、設定された待機時間のカウントを開始する

### Requirement: Autoplay Termination at Last Page
ナビゲーションの結果、最終ページに到達した場合、システムはランダムジャンプ（`lucky-navigation`）を試行しなければならない（SHALL）。ランダムジャンプの候補が存在しない場合に限り、オートプレイのタイマーを停止し、`isAutoplayEnabled` を `false` に変更しなければならない（SHALL）。

#### Scenario: 最終ページ到達時の自動ランダムジャンプ
- **WHEN** オートプレイによる自動遷移の結果、最終ページ（`currentIndex >= imgs.length - 1`）に到達する
- **AND** ランダムジャンプの候補（関連作品または検索キャッシュ）が存在する
- **THEN** システムは `jumpToRandomWork()` を実行し、他の作品へ遷移する
- **AND** この際、`isAutoplayEnabled` は `true` のまま維持される

#### Scenario: ジャンプ候補がない場合のオートプレイ停止
- **WHEN** オートプレイにより最終ページに到達する
- **AND** ランダムジャンプの候補が一つも存在しない
- **THEN** オートプレイのタイマーは解除され、`isAutoplayEnabled` は `false` に変更される
