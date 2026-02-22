## Why

現在の開発者ガイド（`README.md`, `README.ja.md`）には、husky のセットアップ手順や役割が明記されていません。
husky はコミット時に品質チェック（`lint`, `test`, `build` 等）を自動実行し、リポジトリの整合性を保つ重要な役割を果たしていますが、そのセットアップが `npm install` で自動的に行われることや、手動でセットアップが必要な場合のコマンドが示されていないため、開発者のオンボーディングに支障が出る可能性があります。

## What Changes

- `README.md` および `README.ja.md` の「準備」セクションに、`npm install` による husky の自動セットアップと、手動でのセットアップコマンドを追記します。
- `README.md` および `README.ja.md` の「開発ワークフロー」セクションに、コミット時に自動的に品質チェック（Gitフック）が走る旨の説明を追記します。

## Capabilities

### New Capabilities
- `developer-onboarding`: 開発環境のセットアップとワークフローの理解を助けるドキュメント基準を定義します。

### Modified Capabilities
- `pre-commit-verification`: 既存の検証要件に加え、その存在とセットアップ方法が開発者に明示されていることを要件に含めます。

## Impact

- `README.md`, `README.ja.md` のドキュメント。
- 開発者がプロジェクトに参加する際のセットアップ体験。
