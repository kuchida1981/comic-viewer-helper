# Design

## Context

現状の指示書・スキルの構成とドリフト内容は [proposal.md](./proposal.md) を参照。

## Goals / Non-Goals

**Goals:**
- プロジェクト情報、アーキテクチャ方針、品質基準、言語設定、開発ワークフロー、禁止事項のすべてを `AGENTS.md` 1 ファイルに集約する。
- `CLAUDE.md`、`GEMINI.md`、各 `development-workflow/SKILL.md` から重複記述を排除し、正本（`AGENTS.md`）との不整合が再発しない構造にする。
- 現行の OpenSpec スキル名（`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-sync-specs`）および品質チェック手順（`make all` 等）を正確に反映する。

**Non-Goals:**
- `.claude/skills/openspec-*` や `.agents/skills/openspec-*` など OpenSpec 自動生成スキル自体の変更。
- プロダクションコードやアプリケーション仕様の変更。

## Decisions

1. **正本ファイルとして `AGENTS.md` を採用する**
   - *理由*: `AGENTS.md` はエージェント種別（Claude Code / Gemini CLI / その他）に依存しない中立な標準ファイル名であり、共通ルールの単一管理源として適切である。
   - *代替案*: `CLAUDE.md` または `GEMINI.md` のどちらかを正本にする案もあるが、特定ツール名が正本になると片側のツールから参照する構造が不自然になるため不採用。
2. **`CLAUDE.md` / `GEMINI.md` / 各 `SKILL.md` は `@AGENTS.md` 等による参照ラッパーとする**
   - *理由*: ツールごとに自動読み込みされるエントリーポイント（`CLAUDE.md`, `GEMINI.md`, `.claude/skills/`, `.gemini/skills/`）自体は残すことで各ツールの自動発見機能を維持しつつ、`CLAUDE.md` と `GEMINI.md` では `@AGENTS.md` import 構文を用いて `AGENTS.md` の内容をセッション開始時に自動展開させる。これによりスキル一覧を含め重複記述を完全に排除し、今後のルール変更時に `AGENTS.md` のみを更新すれば済むようにする。
   - *代替案*: シンボリックリンクで統一する案もあるが、OS やツールのファイルウォッチャー・Git 設定によっては扱いが不安定になるケースがあるため、明示的な import 参照ファイルを維持する方が安全。

## Risks / Trade-offs

- [一部のツール環境で `@AGENTS.md` 構文が展開されない可能性] → ユーザーへの案内および各 `SKILL.md` からも `AGENTS.md` を参照するよう明記し、フォールバックできるようにする。
