## Context

現在のプロジェクトには `test.yml` と `lint.yml` の2つのGitHub Actionsワークフローが存在し、それぞれ単体テストとリンティングを検証しています。
しかし、ユーザースクリプトのビルドプロセス（`vite build` とヘッダーの結合）が正常に動作するかどうかを検証する仕組みがCIにありません。

## Goals / Non-Goals

**Goals:**
- プルリクエスト作成時に `npm run build` が正常に終了することを自動検証する。
- ビルド成果物が正しく生成されることを保証する。

**Non-Goals:**
- 生成されたビルド成果物（`dist/`）をアーティファクトとして保存・配布すること（今回は検証のみに留める）。
- デプロイの自動化。

## Decisions

### 1. ワークフローの構成: 独立した `build.yml` の作成
- **Decision**: 既存のワークフロー（`test.yml` や `lint.yml`）にステップを追加するのではなく、新しいワークフローファイル `.github/workflows/build.yml` を作成する。
- **Rationale**:
    - 責務の分離：ビルド、テスト、リンティングを別々のチェック項目としてGitHub UI上に表示させたい。
    - 並列実行：独立したワークフローにすることで、GitHub Actionsによって自動的に並列実行され、CI全体の完了時間を短縮できる。
- **Alternatives Considered**:
    - `test.yml` 内にジョブを追加する：設定ファイルはまとまるが、GitHub UI上での視認性が単一ワークフロー内に閉じ込めてしまう。

### 2. 検証内容
- **Decision**: `npm ci` の後、`npm run build` を実行し、終了コードが 0 であることを確認する。

## Risks / Trade-offs

- **[Risk]** CIの実行時間の増加。
- **[Mitigation]** 本プロジェクトのビルド時間は非常に短いため、リソース消費や待機時間の増加は無視できる範囲である。
