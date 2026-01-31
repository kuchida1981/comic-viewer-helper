# ci-build-verification

## Purpose
CI環境上でビルドプロセスがエラーなく完了することを検証し、ユーザーに提供される成果物の整合性を自動的に保証します。

## Requirements

### Requirement: CI環境でのビルド成功
システムは、GitHub Actions などの CI パイプラインにおいて、プロジェクトのビルドプロセス（Vite によるビルドおよび UserScript ヘッダーの結合）がエラーなく完了することを保証しなければならない（SHALL）。

#### Scenario: ビルドコマンドの正常終了
- **WHEN** CI上で `npm run build` コマンドが実行される
- **THEN** コマンドは終了コード 0 で完了し、ビルドエラーが発生しないこと
- **AND** `dist/` ディレクトリに必要な成果物が生成されること
