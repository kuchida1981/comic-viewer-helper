# Tasks

## 1. 正本ドキュメント（AGENTS.md）の作成

- [ ] 1.1 `CLAUDE.md` と `GEMINI.md` の内容を統合し、プロジェクト情報・アーキテクチャ・品質基準・言語・開発ワークフロー（Draft PR、`--no-verify`/`-n` 禁止、`git add .`/`-A` 禁止、`make all`、OpenSpec スキル名）を網羅した `AGENTS.md` を作成する

## 2. エントリーポイントとスキルの整理

- [ ] 2.1 `CLAUDE.md` と `GEMINI.md` を、`AGENTS.md` を参照する薄いラッパー構成に更新する
- [ ] 2.2 `.claude/skills/development-workflow/SKILL.md` と `.gemini/skills/development-workflow/SKILL.md` を、`AGENTS.md` のワークフローと現行 OpenSpec スキル名（`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`）を参照する統一された内容に更新する

## 3. 検証

- [ ] 3.1 旧スキル名（`openspec-new-change`, `openspec-verify-change`）や `src/logic.js` が対象ファイルに残存していないことを `grep` 等で確認する
- [ ] 3.2 `make all`（`test`, `lint`, `typecheck`, `docs`, `build`）を実行し、すべてエラーなしで完了することを確認する
