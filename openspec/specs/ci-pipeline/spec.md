# ci-pipeline

## Purpose
GitHub Actions を使用して、プルリクエストごとに自動的に品質チェック（テスト、Lint、型チェック、ビルド）を実行し、マージ前のコード品質を担保します。

## Requirements

### Requirement: 継続的インテグレーションによる品質保証
システムは、プルリクエストの作成時または更新時、および配布用ブランチへのデプロイ前に、定義されたすべての品質チェックを自動的に実行しなければならない（SHALL）。

#### Scenario: 全ての品質チェックの実行
- **WHEN** ブランチに対してプルリクエストが作成・更新される、または `master` ブランチにプッシュされる
- **THEN** ユニットテスト、リンティング、ビルド検証、型チェック、およびカバレッジ計測が実行されること
- **AND** OpenSpec ドキュメントの整合性検証（validation）が実行されること

### Requirement: チェック失敗時のマージブロック
Lint エラー、警告、またはテストの失敗が検出された場合、CI パイプラインは失敗ステータスを返し、品質基準を満たさないコードのマージを阻止しなければならない（SHALL）。

#### Scenario: Lint エラーまたは警告の検出
- **WHEN** コードに Lint エラーまたは警告が含まれている
- **THEN** GitHub Actions のジョブが失敗（Failure）としてマークされること

### Requirement: ソース管理からのビルド成果物の除外
メインおよび作業ブランチにおいて、ビルドによって生成される成果物は Git の管理対象から除外されなければならない（SHALL）。

#### Scenario: dist ディレクトリの無視
- **WHEN** `npm run build` を実行して `dist/` ディレクトリが生成される
- **THEN** `git status` において `dist/` 配下のファイルが追跡対象（untracked）にならない

### Requirement: ツールバージョンのリポジトリ一元管理と整合
システムは、CI パイプラインおよびローカル検証スクリプトが、リポジトリ内で固定・定義された Node.js バージョン（`.nvmrc`）およびローカル依存の CLI ツール（`npx` 経由）を使用して実行されることを保証しなければならない（SHALL）。

#### Scenario: CI ワークフローでの Node.js バージョン参照
- **WHEN** GitHub Actions の各ワークフローが Node.js 環境をセットアップする
- **THEN** `.nvmrc` ファイルから Node.js バージョンを読み込んで実行環境を構築すること

#### Scenario: OpenSpec CLI のローカル依存バージョン実行
- **WHEN** `make docs`、`make all`、`.husky/pre-commit`、または CI ワークフローが OpenSpec 検証を実行する
- **THEN** グローバルにインストールされた版ではなく `npx openspec` により `package.json` で固定されたローカル依存バージョンが実行されること
