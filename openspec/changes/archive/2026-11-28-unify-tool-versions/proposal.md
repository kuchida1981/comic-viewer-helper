# Proposal

## Why

ローカル環境と CI 環境の間でツールバージョン（`openspec` CLI および Node.js）の不整合が発生しており、開発・検証の再現性を損なっている（関連 Issue: #284）。

1. `Makefile` の `docs` ターゲットが `npx` なしで裸の `openspec` を呼び出しているため、グローバルインストール版（例: `v2.1.1`）が参照される一方、`.husky/pre-commit` と CI（`.github/workflows/check-openspec.yml`）は `npx openspec` 経由で `package.json` 固定版（`v1.1.1`）を参照している。また、グローバルに `openspec` が未導入の環境では `make docs` / `make all` が失敗する。さらに、リポジトリ内の OpenSpec スキル（`.agents/skills/openspec-*`）は v2 系の CLI コマンド（`openspec context` 等）を前提としており、ローカル依存 `v1.1.1` と不整合がある。
2. GitHub Actions ワークフロー（`.github/workflows/*.yml`）は `node-version: '20'` をハードコードしているが、リポジトリ内に `.nvmrc` や `package.json` の `engines.node` が存在せず、ローカル環境とのバージョン統一・検知ができていない。

## What Changes

- `Makefile` の `docs` ターゲットを `npx openspec validate --strict --all` に統一する。
- `package.json` の `@fission-ai/openspec` を `^2.1.1` に更新（および `package-lock.json` を更新）し、スキル・ローカル・CI で同一の OpenSpec CLI バージョン（v2 系）を利用できるようにする。
- リポジトリルートに `.nvmrc`（`22`）を追加し、`package.json` に `engines.node`（`>=22.20.0`）を定義する。
- `.github/workflows/` 配下の全ワークフロー（`build.yml`, `check-openspec.yml`, `deploy.yml`, `lint.yml`, `test.yml`）の `actions/setup-node@v4` 設定を `node-version-file: '.nvmrc'` に変更し、ローカルと CI で Node.js バージョンの定義元を一元化する。

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `ci-pipeline`: CI ワークフローがリポジトリで固定された Node.js バージョン定義（`.nvmrc`）とローカル依存のツールバージョンを使用して検証を実行することを要件に追加する。
- `developer-onboarding`: ローカル環境での開発・検証（`make all` 等）においてグローバルツールへの依存を排除し、リポジトリ定義のツールバージョンで再現可能に実行できることを要件に追加する。

## Impact

- `Makefile`
- `package.json`, `package-lock.json`
- `.nvmrc`（新規追加）
- `.github/workflows/build.yml`, `check-openspec.yml`, `deploy.yml`, `lint.yml`, `test.yml`
- `openspec/specs/ci-pipeline/spec.md`, `openspec/specs/developer-onboarding/spec.md`（デルタマージ後）
