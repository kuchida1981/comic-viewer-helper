# Spec Delta

## ADDED Requirements

### Requirement: ツールバージョンのリポジトリ一元管理と整合
システムは、CI パイプラインおよびローカル検証スクリプトが、リポジトリ内で固定・定義された Node.js バージョン（`.nvmrc`）およびローカル依存の CLI ツール（`npx` 経由）を使用して実行されることを保証しなければならない（SHALL）。

#### Scenario: CI ワークフローでの Node.js バージョン参照
- **WHEN** GitHub Actions の各ワークフローが Node.js 環境をセットアップする
- **THEN** `.nvmrc` ファイルから Node.js バージョンを読み込んで実行環境を構築すること

#### Scenario: OpenSpec CLI のローカル依存バージョン実行
- **WHEN** `make docs`、`make all`、`.husky/pre-commit`、または CI ワークフローが OpenSpec 検証を実行する
- **THEN** グローバルにインストールされた版ではなく `npx openspec` により `package.json` で固定されたローカル依存バージョンが実行されること
