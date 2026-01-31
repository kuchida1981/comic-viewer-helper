## ADDED Requirements

### Requirement: 配布用ブランチへの自動デプロイ
システムは、`main` ブランチへのプッシュをトリガーとして、最新のビルド成果物を配布専用ブランチ（`release`）に自動的にデプロイしなければならない（SHALL）。

#### Scenario: 自動デプロイの実行
- **WHEN** `main` ブランチにコミットがプッシュされる
- **THEN** 最新のソースコードがビルドされ、生成された `dist/*.user.js` が `release` ブランチに自動的にコミット・プッシュされる

### Requirement: インストールURLの最新化
配布用ブランチ（`release`）のビルド成果物は、常に最新の安定版として Raw URL 経由で提供されなければならない（SHALL）。

#### Scenario: Raw URL によるインストール
- **WHEN** ユーザーが `release` ブランチの `dist/comic-viewer-helper.user.js` の Raw URL にアクセスする
- **THEN** 最新のビルド済みスクリプトがダウンロードまたはインストールできる
