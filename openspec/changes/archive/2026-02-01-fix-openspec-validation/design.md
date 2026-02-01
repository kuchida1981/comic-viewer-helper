## Context

OpenSpec は、要件定義書（Spec）と実装の乖離を防ぐための仕組みですが、現在一部のスペックファイルが OpenSpec の厳密なフォーマット要件を満たしておらず、`openspec validate` コマンドでエラーが発生しています。また、このバリデーションを継続的に実行する仕組みがないため、将来的な劣化を防ぐことができません。

## Goals / Non-Goals

**Goals:**
- 現在報告されているすべてのバリデーションエラーを解消する。
- GitHub Actions に `openspec validate` を組み込み、PR 時にドキュメントの整合性を自動チェックする。

**Non-Goals:**
- 既存のスペックの内容（要件そのもの）を変更すること。今回はあくまでフォーマットの修正にとどめる。

## Decisions

### 1. バリデーションエラーの修正方針
- **インデントの修正**: `#### Scenario` などのヘッダ行頭にある不要なスペースを削除する。
- **空行の追加**: ヘッダ間やブロック間に適切な空行を追加し、パーサーが構造を正しく認識できるようにする。
- **構造の正規化**: `Requirement` ブロック内に必ず `Scenario` が含まれるようにする（現状は含まれているように見えるが、パーサーが認識できていないだけの可能性が高い）。

### 2. CI への組み込み方針
- `.github/workflows/lint.yml` にステップを追加するか、新規に `.github/workflows/check-docs.yml` を作成する。
- 既存の `lint.yml` が「静的解析」の役割を担っているため、ここに `OpenSpec Validation` ステップを追加するのが自然である。

## Risks / Trade-offs

- **[Risk] パーサーの挙動**: 手動修正しても、OpenSpec のパーサーのバージョンアップ等により将来的に再びエラーになる可能性がある。
  - **Mitigation**: CI で常に最新の `openspec` CLI を使用し、エラーが出たら即座に修正する運用を徹底する。

## Migration Plan

1. ローカルでスペックファイルを修正し、`npx openspec validate --strict --all` がパスすることを確認する。
2. `.github/workflows/lint.yml` を修正し、バリデーションステップを追加する。
3. PR を作成し、CI がパスすることを確認する。
