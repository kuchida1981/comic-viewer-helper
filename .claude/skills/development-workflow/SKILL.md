---
name: development-workflow
description: このプロジェクトの開発ワークフローを確認・実行する。機能追加、リファクタリング、バグ修正の際に使用。
invocable: true
metadata:
  author: Kosuke Uchida
  version: "2.0"
---

このプロジェクトにおける開発ワークフローを実行します。
詳細なルール・禁止事項・品質基準の正本はリポジトリルートの `AGENTS.md` です。必ず `AGENTS.md` をあわせて参照してください。

## ワークフロー概要

1. **GitHub Issue の確認** → イシュー内容を理解する
2. **OpenSpec 提案の作成** → `openspec-propose`（必要に応じて `openspec-explore`）で `proposal.md`, `specs/`, `design.md`, `tasks.md` を作成し、ユーザーレビューを受ける
3. **トピックブランチ作成と提案のコミット** → GitHub Flow に従いトピックブランチを作成し、OpenSpec 提案を個別パス指定でコミットする
4. **実装と検証** → `openspec-apply-change` に沿って実装し、必要に応じて `README.md` / `README.ja.md` を更新する。実装後は `make all`（`test`, `lint`, `typecheck`, `docs`, `build`）をすべてパスさせる
5. **Draft プルリクエスト作成** → トピックブランチをプッシュし、`gh pr create --draft` で Draft PR を作成する（動作確認用 TODO チェックリストと `Closes #<issue>` を必須とする）
6. **レビュー・動作確認後** → `openspec-archive-change` で変更をアーカイブし、コミット・プッシュしてユーザーにマージを依頼する

## ガードレール（抜粋・詳細は `AGENTS.md` 参照）

- **実装ステップに到達するまで本番コードを書かないこと**
- **`--no-verify` / `-n` によるフックバイパス、および `git add .` / `git add -A` の一括ステージングを禁止する**
- **PR は Draft で作成し、必ず動作確認用 TODO リストと Issue リンクを含めること**
- **ユーザーの動作確認をスキップしないこと**
