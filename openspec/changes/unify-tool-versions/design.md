# Design

## Context

現在の環境構成と制約については [proposal.md](./proposal.md) の Why セクションを参照。
`package.json` の `@fission-ai/openspec` は従来 `^1.1.1` だったが、リポジトリ内の OpenSpec スキル（`.agents/skills/openspec-*`）は v2 系の CLI サブコマンド（`openspec context --json` 等）を使用しており、グローバル環境には `2.1.1` が導入されている。また、GitHub Actions ワークフロー（5ファイル）は `node-version: '20'` を個別にハードコードしている。

## Goals / Non-Goals

**Goals:**
- `Makefile`、`.husky/pre-commit`、GitHub Actions ワークフローのすべてで同一バージョンの `openspec` CLI（`npx openspec`）を実行できるようにする。
- `.nvmrc` と `package.json` の `engines.node` により Node.js バージョンをリポジトリで一元定義し、CI ワークフローから参照する。

**Non-Goals:**
- GitHub Actions の他のステップやワークフロートリガーの変更。

## Decisions

1. **`@fission-ai/openspec` のバージョンを `^2.1.1` へ更新する**
   - *理由*: `.agents/skills/openspec-*` が v2 系コマンドに依存しているため、`1.1.1` のままではスキル実行時に `npx openspec context` 等が失敗する。`^2.1.1` に上げることで、ローカル依存・スキル・グローバル環境が一致する。
   - *代替案*: `1.1.1` を維持する案もあったが、スキルとの不整合が残るため不採用とした。なお、`2.1.1` で既存の 62 個の specs が `validate --strict --all` にパスすることは事前確認済み。
2. **`.nvmrc` に `22` を指定し、`package.json` の `engines.node` に `>=22.20.0` を設定する**
   - *理由*: `@fission-ai/openspec` `2.1.1` が `engines.node: >=22.20.0` を要求しているため、従来の CI 環境（Node 20）ではパッケージの動作要件を満たせない。Active LTS / Maintenance LTS であり要件を満たす Node 22 系を `.nvmrc` に指定し、`node-version-file: '.nvmrc'` で CI と定義元を統一する。
   - *代替案*: Node 20 を維持する案もあったが、`@fission-ai/openspec` 2.1.1 の `engines.node` 要件と矛盾するため不採用とした。

## Risks / Trade-offs

- [`@fission-ai/openspec` のメジャーバージョンアップおよび CI の Node 22 化] → `npm install` 後に `npx openspec validate --strict --all` および全テスト・Lint・ビルドを実行して互換性を確認する。
