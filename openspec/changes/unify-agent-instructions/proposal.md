# Proposal

## Why

コーディングエージェント向けのプロジェクト指示・開発ワークフローが `CLAUDE.md`、`GEMINI.md`、`.claude/skills/development-workflow/SKILL.md`、`.gemini/skills/development-workflow/SKILL.md` の 4 ファイルに重複して管理されており、内容のドリフトが発生している（関連 Issue: #285）。

具体的には、Draft PR 作成指定や `--no-verify` / `-n` 禁止ルールが `GEMINI.md` のみに記載されている点、事前品質チェックの記述が `CLAUDE.md`（`make all`）と `GEMINI.md`（個別コマンド列挙）で異なる点、`.claude/skills/development-workflow/SKILL.md` に存在しない古い OpenSpec スキル名（`/openspec-new-change`, `/openspec-verify-change`）が残存している点などが挙げられる。これらを単一の正本（Single Source of Truth）に集約し、どのエージェントを使用しても同じルール・手順が再現されるようにしたい。

## What Changes

- リポジトリルートに共通指示・開発ワークフローの正本ファイル `AGENTS.md` を新設する。
- `CLAUDE.md` と `GEMINI.md` を、`AGENTS.md` を正本として参照する最小限の構成へ整理する。
- `.claude/skills/development-workflow/SKILL.md` と `.gemini/skills/development-workflow/SKILL.md` の重複を解消し、`AGENTS.md` のワークフローを参照する構成へ統一する（古い OpenSpec スキル名・`src/logic.js` 表記等を削除・更新）。

## Capabilities

### New Capabilities

（なし — エージェント向け運用ドキュメントのリファクタリングであり、アプリケーションの外部仕様・振る舞いは変更しないため `skip_specs: true` とする）

### Modified Capabilities

（なし）

## Impact

- `AGENTS.md`（新規追加）
- `CLAUDE.md`
- `GEMINI.md`
- `.claude/skills/development-workflow/SKILL.md`
- `.gemini/skills/development-workflow/SKILL.md`
