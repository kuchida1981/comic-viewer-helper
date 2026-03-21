# sync-data-via-gist Specification

## Purpose
TBD - created by archiving change sync-data-via-gist. Update Purpose after archive.
## Requirements
### Requirement: GitHub Gist 連携設定
システムは、ユーザーが GitHub Personal Access Token (PAT) と Gist ID を入力し、同期を有効化・無効化できる設定項目を提供しなければならない (MUST)。また、設定の保存時には、その有効性を即座に確認し、ユーザーにフィードバックを提供しなければならない (SHALL)。

#### Scenario: 同期設定の保存と即時検証
- **WHEN** ユーザーが PAT と Gist ID を入力して保存ボタンをクリックしたとき
- **THEN** 設定がローカルに保存され、即座に GitHub Gist へのアップロードが試行される
- **THEN** 処理中、保存ボタンは無効化され「保存中...」等の状態が表示される

#### Scenario: 同期設定保存の成功フィードバック
- **WHEN** 保存ボタン押下後のアップロード試行が成功したとき
- **THEN** ユーザーに「保存完了」等の成功メッセージが緑色で表示される
- **THEN** 数秒後、メッセージは消え、通常の同期ステータス表示（最終同期時刻など）に戻る

#### Scenario: 同期設定保存の失敗フィードバック
- **WHEN** 保存ボタン押下後のアップロード試行が失敗したとき（例: 無効な PAT、ネットワークエラー）
- **THEN** ユーザーにエラー内容を含む失敗メッセージが赤色で表示される
- **THEN** 保存ボタンは再度有効化され、ユーザーが設定を修正して再試行できるようになる

### Requirement: データの自動アップロード (Push)
同期が有効な場合、システムはローカルデータの変更を検知し、一定時間（デバウンス時間）経過後に GitHub Gist へ自動的にアップロードしなければならない (MUST)。

#### Scenario: データ変更による自動アップロード
- **WHEN** お気に入りや設定などの永続化対象データが更新されたとき
- **THEN** 一定時間待機したのち、最新 of JSON データが `GM_xmlhttpRequest` を通じて Gist にアップロードされる

### Requirement: データの自動ダウンロード (Pull)
同期が有効な場合、システムはアプリケーションの初期化時、GitHub Gist から最新データを取得し、ローカル状態に反映させなければならない (MUST)。

#### Scenario: 起動時の自動同期
- **WHEN** アプリケーションが初期化され、同期設定が有効なとき
- **THEN** システムは Gist からデータを取得し、ローカルの `Store` の状態を更新する

### Requirement: 競合の解決
システムは、ローカルとリモートのデータの更新時刻を比較し、最新のデータを優先して適用しなければならない (MUST)。

#### Scenario: リモートが新しい場合の更新
- **WHEN** Gist から取得したデータの `lastSyncedAt` がローカルのそれよりも新しいとき
- **THEN** ローカルのデータはリモートから取得したデータで上書きされる

