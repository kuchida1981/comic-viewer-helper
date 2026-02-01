## Why

現在、OpenSpec ドキュメントの一部でバリデーションエラーが発生しており、ドキュメントの信頼性が損なわれています。また、これらの不整合を検知する仕組みが CI に存在しないため、将来的に再び壊れたドキュメントが混入するリスクがあります。
本変更では、既存のスペックの不整合を解消し、CI パイプラインに OpenSpec のバリデーションチェックを組み込むことで、ドキュメントの品質と整合性を永続的に保証します。

## What Changes

- バリデーションエラーが発生している以下のスペックファイルを修正します：
  - `openspec/specs/activation-toggle/spec.md`
  - `openspec/specs/ci-testing/spec.md`
  - `openspec/specs/multilingual-support/spec.md`
  - `openspec/specs/page-jump/spec.md`
  - `openspec/specs/pr-enforcement/spec.md`
- GitHub Actions のワークフローに `openspec validate --strict --all` を実行するステップを追加します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- **ci-pipeline**: CI パイプラインの要件に、ドキュメント検証（OpenSpec validation）の実行を追加します。

## Impact

- **CI/CD**: プルリクエスト作成時およびマージ時に、ドキュメントの整合性チェックが走るようになります。ドキュメントに不備がある PR はマージできなくなります。
- **ドキュメント**: 既存のスペックファイルのフォーマットが修正されます（内容の変更はありません）。
