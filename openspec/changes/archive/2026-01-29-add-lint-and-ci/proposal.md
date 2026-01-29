## Why

現在のユーザースクリプトは、静的解析や自動チェックのない単一の大きなファイルとして管理されています。これにより、構文エラーやグローバル変数の誤用、スタイルの不一致が発生しやすく、開発中にバグを混入させるリスクが高まっています。

## What Changes

- 開発用依存関係を管理するための Node.js プロジェクト環境 (`package.json`) を初期化します。
- Tampermonkey ユーザースクリプト向けに構成された ESLint を導入し、静的解析を実行可能にします。
- GitHub への Push や Pull Request 時に、自動的に Lint チェックを実行する GitHub Actions ワークフローを設定します。
- 新しい Lint ルールによって検出された既存コードの問題を修正します。

## Capabilities

### New Capabilities
- `linting`: ESLint を使用してコードの品質基準を強制し、一般的なエラーを防止します。
- `ci-pipeline`: GitHub Actions を介して、変更ごとにコード品質の自動検証を行います。

### Modified Capabilities
<!-- 仕様レベルで変更される既存の機能はありません。 -->

## Impact

- **開発環境**: ローカルでチェックを実行するために `npm` が必要になります (`npm run lint`)。
- **コードベース**: `comic-viewer-helper.user.js` は、Lint ルールを満たすために軽微なリファクタリングが行われる可能性があります。
- **ワークフロー**: GitHub へのプッシュ時に自動チェックがトリガーされます。PR には Lint の実行結果が表示されます。