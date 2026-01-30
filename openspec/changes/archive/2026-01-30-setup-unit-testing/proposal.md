## Why

現在、本プロジェクトには自動テストが存在せず、コードの変更が既存の機能に与える影響を保証することが困難です。GitHub Issue #9 に基づき、ユニットテストを導入することで、開発の効率化と品質の安定化を図ります。また、GitHub Actions でテストを自動実行することで、継続的な品質管理を実現します。

## What Changes

- ユニットテストフレームワーク（Vitest または Jest を想定）の導入
- プロジェクトのコアロジックに対する初期テストの作成
- GitHub Actions を使用した、プルリクエストおよびプッシュ時の自動テスト実行ワークフローの構築

## Capabilities

### New Capabilities
- `unit-testing`: ユニットテストの実行環境と、主要な関数・クラスに対するテストコードを提供します。
- `ci-testing`: GitHub Actions を用いた自動テスト実行機能を提供します。

### Modified Capabilities
<!-- なし -->

## Impact

- `package.json`: テストフレームワークに関連する依存関係（devDependencies）と `scripts.test` の追加。
- `.github/workflows/`: テスト実行用の新しい YAML ファイルの作成。
- コードベース全体: テストコードを記述するための `*.test.js` ファイルの追加。
