## Why

プロジェクトの規模拡大に伴い、レイヤードアーキテクチャの依存関係をコードレビューだけでなく自動的に強制する仕組みが必要です。特に `src/logic.ts` が純粋関数のみを含み、DOMに依存しないといった重要な設計ルールを ESLint で検証可能にし、アーキテクチャの腐敗を未然に防ぎます。

## What Changes

- `eslint-plugin-boundaries` を導入し、レイヤー間の依存関係を制限します。
- `eslint.config.mjs` にレイヤー定義と依存ルールを追加します。
- 下位レイヤーから上位レイヤーへの不適切なインポートをエラーとして検出します。
- 全てのレイヤーから参照可能な `Shared` 要素（型定義やユーティリティ）を定義し、生産性を維持します。

## Capabilities

### New Capabilities
- `layered-architecture-enforcement`: ESLint を使用したレイヤードアーキテクチャの依存関係強制ルール。

### Modified Capabilities
<!-- なし -->

## Impact

- `eslint.config.mjs`: 設定の追加。
- `package.json`: `eslint-plugin-boundaries` の追加。
- `src/**/*`: 既存のインポート関係のチェック（現状の調査では違反なし）。
- 開発ワークフロー: CIでのリンターチェックにより、不適切な依存関係を持つコードのコミットを阻止。
