# autoplay-control

## Purpose
このスペックは、漫画を自動的に読み進める「オートプレイ機能」の動作、制御ロジック、およびユーザーインターフェースに関する要件を定義します。

## Requirements

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
