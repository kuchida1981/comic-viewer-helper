## Why

現在、ビルド成果物（`dist/*.user.js`）がメインブランチで管理されており、コミットのたびに巨大な差分が発生してコードレビューを妨げ、リポジトリを不必要に肥大化させています。ソースコードの管理をクリーンに保ちつつ、Tampermonkey 等での Raw URL インストールの利便性を維持するため、成果物管理の自動化とブランチ分離が必要です。

## What Changes

- `.gitignore` に `dist/` を追加し、メインおよび作業ブランチから成果物を除外します。
- GitHub Actions を導入し、`master` ブランチへのプッシュをトリガーに自動ビルドを実行します。
- ビルドされた成果物を、自動的に配布専用の `release` ブランチへプッシュする仕組みを構築します。
- `README.md` 等のインストールリンクを、新しい `release` ブランチの Raw URL へ更新します。

## Capabilities

### New Capabilities
- `ci-deployment`: ビルド成果物の配布専用ブランチへの自動デプロイ機能。

### Modified Capabilities
- `ci-pipeline`: ビルドフローと成果物管理ルールの更新。

## Impact

- `.gitignore`: `dist/` の除外設定。
- `.github/workflows/`: デプロイ用ワークフローの新規作成。
- `README.md`, `README.ja.md`: インストール URL の変更。
- プロジェクト構造: 配布用ブランチ (`release`) の導入。
