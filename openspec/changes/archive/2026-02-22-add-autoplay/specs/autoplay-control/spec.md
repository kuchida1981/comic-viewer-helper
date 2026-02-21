## ADDED Requirements

### Requirement: Autoplay Execution
システムは、オートプレイが有効な場合、設定された待機時間ごとに自動的に「次へ」のナビゲーション（`scrollToImage(1)`）を実行しなければならない（SHALL）。

#### Scenario: 自動ページ送り
- **WHEN** オートプレイが有効（`isAutoplayEnabled: true`）である
- **AND** 設定された待機時間（`autoplayInterval`）が経過する
- **THEN** 自動的に `scrollToImage(1)` が呼び出され、次の画像へスクロールする

### Requirement: Autoplay Timer Reset on User Interaction
ユーザーが手動でページ送り、ページジャンプ、見開き設定の変更などの操作を行った場合、オートプレイのタイマーは即座にリセットされ、現在のページから設定された待機時間を再度カウント開始しなければならない（SHALL）。これにより、ユーザーが読み終える前に勝手にページがめくられることを防止する。

#### Scenario: 手動ページ送りによるタイマーリセット
- **WHEN** オートプレイが有効である
- **AND** ユーザーがキーボード、クリック、またはGUIボタンで「次へ」または「前へ」の操作を行う
- **THEN** 現在の待機カウントは破棄され、操作完了後から新たに設定秒数のカウントを開始する

#### Scenario: ページジャンプによるタイマーリセット
- **WHEN** オートプレイが有効である
- **AND** ユーザーがページ番号を入力してジャンプする
- **THEN** ジャンプ先のページが表示された時点から、新たに設定秒数のカウントを開始する

### Requirement: Autoplay Termination at Last Page
ナビゲーションの結果、最終ページに到達して作品情報（メタデータモーダル）が表示された場合、オートプレイのタイマーは自動的に停止または解除されなければならない（SHALL）。

#### Scenario: 最終ページ到達での停止
- **WHEN** オートプレイによる自動遷移または手動操作により、最終ページに到達する
- **AND** 作品情報モーダルが表示される
- **THEN** オートプレイのタイマーは解除され、`isAutoplayEnabled` は `false` に変更される

### Requirement: Autoplay Toggle Shortcut
システムは、オートプレイの有効/無効を素早く切り替えるためのキーボードショートカット（`a` キー）を提供しなければならない（SHALL）。

#### Scenario: 'a' キーによるオートプレイのトグル
- **WHEN** ユーザーが `a` キーを押下する
- **AND** スクリプトが有効である
- **THEN** オートプレイの有効/無効状態（`isAutoplayEnabled`）がトグルされる

### Requirement: Autoplay Interval Configuration UI
GUIパネルには、オートプレイの有効/無効を切り替えるチェックボックスと、待機秒数（1〜99秒）を指定する数値入力フィールドが含まれていなければならない（SHALL）。

#### Scenario: 待機時間の変更
- **WHEN** ユーザーがGUIの数値入力フィールドで待機時間を変更する
- **THEN** `Store` の `autoplayInterval` が更新される
- **AND** オートプレイが有効な場合は、新しい待機時間に基づいてタイマーが再設定される
