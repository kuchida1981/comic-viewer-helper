# Spec Delta

## ADDED Requirements

### Requirement: グローバルツール非依存での品質チェック実行
システムは、開発者がグローバルに個別ツール（`openspec` CLI 等）をインストールしていなくても、`npm install` 後に `make all` や `make docs` を含むすべての検証コマンドを実行できなければならない（MUST）。

#### Scenario: グローバルに openspec が未導入の環境での make all 実行
- **WHEN** `openspec` がグローバルにインストールされていない環境で `npm install` 後に `make all` を実行する
- **THEN** `Makefile` がローカル依存の `npx openspec` を呼び出し、すべてのチェックが正常に実行されること

#### Scenario: リポジトリ指定の Node.js バージョンの明示
- **WHEN** 開発者がリポジトリルートを確認する
- **THEN** `.nvmrc` および `package.json` の `engines.node` により推奨・要求される Node.js バージョンが明示されていること
