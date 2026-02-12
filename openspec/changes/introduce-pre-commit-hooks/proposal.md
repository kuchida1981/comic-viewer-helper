## Why

コードの品質チェック（Lint、型チェック、テスト、ビルド、OpenSpec検証）をコミット前に自動実行することで、不具合や規約違反がある状態でのコミットを防止します。これにより、CIでの失敗を減らし、開発サイクルの効率を高めます。

## What Changes

- `husky` を導入し、Git の `pre-commit` フックを有効化します。
- `lint-staged` を導入し、ステージングされたファイルに対してのみ効率的に Lint を実行します。
- コミット前に以下のチェックを自動実行するフローを構築します：
    - `lint-staged` による ESLint チェック（差分ファイル対象）
    - `npm run check-types` による型チェック（全体対象）
    - `npm run test` による全件テスト（全体対象）
    - `npm run build` によるビルド確認（全体対象）
    - `npx openspec validate` による OpenSpec 整合性チェック（全体対象）

## Capabilities

### New Capabilities
- `pre-commit-verification`: コミット前にコード品質と整合性を自動的に検証する機能。

### Modified Capabilities
- `linting`: 実行タイミングにコミット前（ローカル）が追加されます。
- `unit-testing`: 実行タイミングにコミット前（ローカル）が追加されます。
- `typescript-toolchain`: 実行タイミングにコミット前（ローカル）が追加されます。
- `ci-build-verification`: ローカルでのビルド確認がコミットフローに組み込まれます。

## Impact

- 開発フロー: `git commit` 実行時に自動的にチェックが走るようになります（約8秒程度）。
- 依存関係: `husky`, `lint-staged` が `devDependencies` に追加されます。
- ファイル構成: `.husky/` ディレクトリと関連設定ファイルが追加されます。
