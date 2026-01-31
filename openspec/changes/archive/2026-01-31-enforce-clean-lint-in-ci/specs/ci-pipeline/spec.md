## MODIFIED Requirements

### Requirement: CI Failure on Lint Error
Lint チェックでエラー**または警告**が検出された場合、CI パイプラインは失敗ステータスを返さなければなりません（SHALL）。これにより、品質基準を満たさないコードのマージを防ぎます。

#### Scenario: Lint error or warning detected in PR
- **WHEN** Pull Request のコードに Lint エラーまたは警告が含まれているとき
- **THEN** GitHub Actions のジョブが失敗（Failure）としてマークされること
