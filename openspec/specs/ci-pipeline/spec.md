# ci-pipeline Specification

## Purpose
TBD - created by archiving change add-lint-and-ci. Update Purpose after archive.
## Requirements
### Requirement: 継続的インテグレーションによる品質保証
システムは、プルリクエストの作成時または更新時に自動的に品質チェックを実行しなければならない。

#### Scenario: 全ての品質チェックの並列実行
- **WHEN** `master` または `main` ブランチに対してプルリクエストが作成・更新される
- **THEN** テスト、リンティング、ビルド成功の検証、**および型チェックとカバレッジ計測**が並列に実行されること

### Requirement: CI Failure on Lint Error
Lint チェックでエラー**または警告**が検出された場合、CI パイプラインは失敗ステータスを返さなければなりません（SHALL）。これにより、品質基準を満たさないコードのマージを防ぎます。

#### Scenario: Lint error or warning detected in PR
- **WHEN** Pull Request のコードに Lint エラーまたは警告が含まれているとき
- **THEN** GitHub Actions のジョブが失敗（Failure）としてマークされること

#### Scenario: Clean code in PR
- **WHEN** Pull Request のコードに Lint エラーがないとき
- **THEN** GitHub Actions のジョブが成功（Success）としてマークされること

