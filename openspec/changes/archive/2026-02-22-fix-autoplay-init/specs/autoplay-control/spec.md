## MODIFIED Requirements

### Requirement: Autoplay Execution
システムは、オートプレイが有効な場合、設定された待機時間ごとに自動的に「次へ」のナビゲーション（`scrollToImage(1)`）を実行しなければならない（SHALL）。また、ページロード時（初期化時）にオートプレイが有効な場合、ユーザーの操作を待たずに自動的にタイマーを開始しなければならない（SHALL）。

#### Scenario: 自動ページ送り
- **WHEN** オートプレイが有効（`isAutoplayEnabled: true`）である
- **AND** 設定された待機時間（`autoplayInterval`）が経過する
- **THEN** 自動的に `scrollToImage(1)` が呼び出され、次の画像へスクロールする

#### Scenario: ページロード時のオートプレイ自動開始
- **WHEN** ユーザーが新しいページをロードする
- **AND** ストアの `enabled` が `true` である
- **AND** ストアの `isAutoplayEnabled` が `true` である
- **THEN** ユーザーの操作を待たずに、設定された待機時間のカウントを開始する
