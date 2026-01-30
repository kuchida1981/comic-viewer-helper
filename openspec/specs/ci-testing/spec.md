# ci-testing

## Purpose
GitHub Actions を利用して、コードの品質管理および開発プロセスの検証を自動化します。

## Requirements

### Requirement: GitHub Actions による自動テスト
システムは、GitHub へのプッシュおよびプルリクエストの作成時に、自動的にユニットテストを実行しなければならない（MUST）。

#### Scenario: PR作成時の自動実行
- **WHEN** 開発者が新しいプルリクエストを作成する
- **THEN** GitHub Actions のワークフローが起動し、ユニットテストが実行される

### Requirement: テスト失敗時のブロック
GitHub Actions でのテスト（コードテストおよびプロセス検証）が失敗した場合、そのプルリクエストのマージを制限するためのステータスチェックを提供しなければならない（MUST）。

#### Scenario: テスト失敗の検知
- **WHEN** コードの変更によりテストが失敗する、またはTODOが未完了である
- **THEN** GitHub Actions のジョブが失敗し、GitHub 上で「Failed」ステータスが表示される