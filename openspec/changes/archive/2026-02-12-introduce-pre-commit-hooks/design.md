## Context

現在、このプロジェクトでは `Makefile` を通じて手動で各種チェック（Lint, Type Check, Test, Build, OpenSpec）を行うことが推奨されていますが、これを強制する仕組みはありません。そのため、品質チェックが漏れた状態でコミットやプッシュが行われる可能性があります。

## Goals / Non-Goals

**Goals:**
- `git commit` 実行時に、プロジェクトが健全な状態（すべてのチェックをパスする状態）であることを自動的に保証する。
- すべての検証（Lint, Type Check, Test, Build, OpenSpec）をプロジェクト全体に対して実行し、整合性と品質を最大化する。
- 既存の「Lintエラーをゼロに保つ」運用をコミット段階で強制する。

**Non-Goals:**
- CI（GitHub Actions）側のチェックを廃止すること。
- コーディング中のリアルタイム検証。

## Decisions

### 1. ツール選定: `husky`
Git フックの管理に `husky` を採用します。軽量で設定がシンプルであり、プロジェクト全体のチェックをフックするのに適しています。

### 2. すべてのチェックを全体実行
検討の結果、以下のすべてのチェックをプロジェクト全体に対して実行することに決定しました：
- `npm run lint` (ESLint)
- `npm run check-types` (TSC)
- `npm run test` (Vitest)
- `npm run build` (Vite)
- `npx openspec validate --strict --all` (OpenSpec)

Rationale:
- 現状の合計実行時間が10秒未満と非常に高速であること。
- 一部のファイルのみを対象にすると、ファイル間の依存関係によるエラーを見逃すリスクがあること。
- プロジェクト全体で Lint エラーをゼロに保つ運用を徹底するため。

## Risks / Trade-offs

- **[Risk] コミット時間の増加**
  - [Mitigation] 現在は約8秒程度であり許容範囲内です。将来的に重くなった場合は、各ツールのキャッシュ機能やインクリメンタルビルドを活用して最適化を検討します。
- **[Risk] フックのバイパス**
  - [Mitigation] `git commit --no-verify` で回避可能ですが、CI 側でも同様のチェックを継続することで安全性を担保します。
