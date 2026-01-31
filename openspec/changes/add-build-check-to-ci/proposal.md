## Why

現在のCIパイプライン（GitHub Actions）では、テストの実行とリンティングのチェックは行われていますが、ビルド（`npm run build`）が正常に完了するかどうかの検証が行われていません。
デプロイ可能な成果物（ユーザースクリプト）が正しく生成されることを自動で保証し、ビルドエラーによるリリース不備を未然に防ぐ必要があります。

## What Changes

- GitHub Actions のワークフローにビルド実行ステップを追加します。
- `test.yml` や `lint.yml` と同様のタイミング（プルリクエスト時）にビルドの成功を確認するようにします。
- ビルドコマンド `npm run build` が正常終了（終了コード0）することを検証します。

## Capabilities

### New Capabilities
- `ci-build-verification`: CI上でビルドプロセスがエラーなく完了することを検証する機能。

### Modified Capabilities
- `ci-pipeline`: 既存のCIパイプラインにビルドチェックの要件を追加。

## Impact

- `.github/workflows/build.yml` (新規作成または既存の統合)
- CIの実行時間（わずかに増加するが、ビルド時間が短いため許容範囲内）
