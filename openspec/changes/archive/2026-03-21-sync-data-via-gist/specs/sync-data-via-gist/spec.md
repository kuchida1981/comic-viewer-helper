# sync-data-via-gist Specification

## Purpose
GitHub Gist を利用したユーザーデータの永続化と、複数デバイス間での自動的なデータ同期を実現します。

## ADDED Requirements

### Requirement: GitHub Gist 連携設定
システムは、ユーザーが GitHub Personal Access Token (PAT) と Gist ID を入力し、同期を有効化・無効化できる設定項目を提供しなければならない (MUST)。

#### Scenario: 同期設定の保存
- **WHEN** ユーザーが PAT と Gist ID を入力して保存したとき
- **THEN** 設定が `GM_setValue` を使用してローカルに保存される

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

