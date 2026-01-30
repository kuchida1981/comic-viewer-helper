## MODIFIED Requirements

### Requirement: テスト失敗時のブロック
GitHub Actions でのテスト（コードテストおよびプロセス検証）が失敗した場合、そのプルリクエストのマージを制限するためのステータスチェックを提供しなければならない（MUST）。

#### Scenario: テスト失敗の検知
- **WHEN** コードの変更によりテストが失敗する、またはTODOが未完了である
- **THEN** GitHub Actions のジョブが失敗し、GitHub 上で「Failed」ステータスが表示される
