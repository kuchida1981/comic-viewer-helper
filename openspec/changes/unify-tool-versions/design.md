# Design

## Context

現在の環境構成と制約については [proposal.md](./proposal.md) の Why セクションを参照。
`package.json` の `@fission-ai/openspec` は現在 `^1.1.1` だが、リポジトリ内の OpenSpec スキル（`.agents/skills/openspec-*`）は v2 系の CLI サブコマンド（`openspec context --json` 等）を使用しており、グローバル環境には `2.1.1` が導入されている。また、GitHub Actions ワークフロー（5ファイル）は `node-version: '20'` を個別にハードコードしている。

## Goals / Non-Goals

**Goals:**
- `Makefile`、`.husky/pre-commit`、GitHub Actions ワークフローのすべてで同一バージョンの `openspec` CLI（`npx openspec`）を実行できるようにする。
- `.nvmrc` と `package.json` の `engines.node` により Node.js バージョンをリポジトリで一元定義し、CI ワークフローから参照する。

**Non-Goals:**
- Node.js のメジャーバージョンを 20 から引き上げるマイグレーション（現行 CI と同じ `20` を基準に固定する）。
- GitHub Actions の他のステップやワークフロートリガーの変更。

## Decisions

1. **`@fission-ai/openspec` のバージョンを `^2.1.1` へ更新する**
   - *理由*: `.agents/skills/openspec-*` が v2 系コマンドに依存しているため、`1.1.1` のままではスキル実行時に `npx openspec context` 等が失敗する。`^2.1.1` に上げることで、ローカル依存・スキル・グローバル環境が一致する。
   - *代替案*: `1.1.1` を維持する案もあったが、スキルとの不整合が残るため不採用とした。なお、`2.1.1` で既存の 62 個の specs が `validate --strict --all` にパスすることは事前確認済み。
2. **`.nvmrc` に `20` を指定し、`package.json` の `engines.node` に `>=20` を設定する**
   - *理由*: 現行 CI は `node-version: '20'` で安定稼働しているため破壊的変更を避けつつ、`node-version-file: '.nvmrc'` で CI と定義元を統一できる。`engines.node` を `>=20` とすることで、より新しいローカル Node（例: v24/v25）でも `npm install` 時に不要なエラーでブロックされず、最低要件を明示できる。
   - *代替案*: `engines.node` を `20.x` に厳密固定する案もあるが、ローカルで別バージョンを使う開発者の作業を阻害しないよう `.nvmrc` で推奨バージョンを示しつつ `engines.node` は `>=20` とする。

## Risks / Trade-offs

- [`@fission-ai/openspec` のメジャーバージョンアップによる `package-lock.json` の差分増加] → `npm install` 後に `npx openspec validate --strict --all` および全テスト・Lint・ビルドを実行して互換性を確認する。
