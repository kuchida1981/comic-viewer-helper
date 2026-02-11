## Why

現在、単体テスト（Vitest）は充実していますが、UserScript が実際のブラウザ環境で期待通りに動作するか（DOM操作、スクロール制御、UI注入など）の統合的な自動検証が欠けています。
開発者が手動で行っている検証を自動化し、リグレッションを早期に発見するとともに、AIエージェントによる自動デバッグを容易にする環境を構築します。

## What Changes

- **Playwrightの導入**: ブラウザ自動化ツールとして Playwright を導入し、Chromium でのテストをサポートします。
- **Docker環境の構築**: テスト実行環境を Docker 化し、開発環境や CI (GitHub Actions) に依存しない再現性の高いテストを実現します。
- **Nginxによるモックサーバー**: 静的ファイルを配信する nginx コンテナを導入し、実際のコミックサイトを模した環境でテストを実行できるようにします。
- **CI連携**: GitHub Actions 上で PR ごとに E2E テストが自動実行されるようにワークフローを追加します。

## Capabilities

### New Capabilities
- `e2e-testing-infrastructure`: Docker/Nginx/Playwright を組み合わせたテスト実行基盤。
- `e2e-scenario-navigation`: ページ移動やスクロール操作の検証シナリオ。
- `e2e-scenario-ui-interaction`: UIパネルやモーダルの動作検証シナリオ。
- `e2e-scenario-resume-position`: レジューム機能（続きから読む）の動作検証シナリオ。

### Modified Capabilities
- なし

## Impact

- `package.json`: Playwright 関連の依存関係追加、テスト用スクリプトの追加。
- `openspec/specs/`: E2E テストに関する新規スペックファイルの追加。
- `GitHub Actions`: 新しいテストジョブの追加。
- プロジェクトルートへの `Dockerfile.e2e`, `docker-compose.e2e.yml`, `playwright.config.ts` の追加。
