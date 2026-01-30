## Why

プルリクエスト（PR）の本文に含まれるTODOリストが未完了のままマージされることを防ぎ、開発プロセスの徹底を図るため。GitHub の標準機能には未完了TODOによるマージブロックが存在しないため、GitHub Actions を使用して自動チェックを行います。

## What Changes

- GitHub Actions ワークフロー `.github/workflows/check-todo.yml` を新規作成します。
- PRの作成、編集、および同期（コミットの追加）時に、PRの本文（Description）をスキャンします。
- 未チェックのチェックボックス（`- [ ]`）が見つかった場合、ワークフローを失敗（Fail）させます。

## Capabilities

### New Capabilities
- `pr-enforcement`: PRの品質や完了条件を自動的に検証する機能群を定義します。

### Modified Capabilities
- `ci-testing`: CI環境の役割を拡張し、コードの正しさだけでなく、プロセスの完了状態も検証対象に含めます。

## Impact

- `.github/workflows/check-todo.yml`: 新規作成。
- GitHub PR UI: TODOが未完了の場合にステータスチェックが失敗として表示されます。
