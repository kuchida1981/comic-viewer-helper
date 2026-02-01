## Context

現状、`package.json` と `src/header.js` にバージョン情報が重複しており、`npm run build` は単なる `cat` コマンドによるファイル結合を行っています。また、GitHub Actions は `master` へのプッシュ時に無条件で `release` ブランチへデプロイしています。本設計では、これらを Node.js ベースのビルドスクリプトと高度な CI ワークフローによって自動化・一元化します。

## Goals / Non-Goals

**Goals:**
- `package.json` を唯一のバージョン情報のソースとする。
- `stable` / `unstable` の2系統デプロイフローの確立。
- 実行コード内（UI表示用）へのバージョン情報の自動注入。
- GitHub Release の自動生成。

**Non-Goals:**
- `src/header.js` 内のメタデータ項目（@match 等）の自動生成（今回は対象外）。
- 外部のライブラリ（Semantic Release 等）の導入。

## Decisions

### 1. ビルドスクリプト (`scripts/build.mjs`) の導入
- **概要**: 従来の `cat` ベースのビルドを Node.js スクリプトに置き換える。
- **機能**:
  - `package.json` からバージョンを取得。
  - 環境変数 `IS_UNSTABLE=true` が指定されている場合、バージョン末尾に `-unstable` を付与。
  - Vite ビルドを実行。
  - `src/header.js` を読み込み、`@version` 行を動的に書き換える。
  - 書き換えたヘッダとビルド済みの成果物を結合し、`dist/` に出力。
- **理由**: バージョン情報の自動加工とファイル結合を、プラットフォームに依存せず確実に制御するため。

### 2. Vite `define` による情報注入
- **設定**: `vite.config.mjs` で `__APP_VERSION__` および `__IS_UNSTABLE__` を定義。
- **利用**: UI コンポーネント（`MetadataModal.js` 等）でこれらを参照して表示を行う。

### 3. GitHub Actions (`deploy.yml`) の刷新
- **トリガー**:
  - `push to master`: `IS_UNSTABLE=true` をセットしてビルドし、`unstable` ブランチへデプロイ。
  - `push tag (X.Y.Z)`: `IS_UNSTABLE=false`（デフォルト）でビルドし、`stable` ブランチへデプロイ。
- **GitHub Release**: タグプッシュ時に、ビルド成果物（`.user.js`）を添付した Release を自動作成する。

## Risks / Trade-offs

- **[Risk] 既存ユーザーの更新停止** → **[Mitigation]** `release` ブランチを一度だけ「`stable` への移行を促すメタデータ」を含む版で更新し、その後に廃止する。
- **[Risk] ビルドスクリプトの複雑化** → **[Mitigation]** 外部依存を極力排除し、Node.js 標準の `fs` や `child_process` のみを使用したシンプルなスクリプトにする。
- **[Risk] タグ名と package.json の不一致** → **[Mitigation]** CI 上で不一致を検出し警告、またはタグ名を優先するなどのガードレールを検討。

## Migration Plan

1. `scripts/build.mjs` を実装し、ローカルで動作確認。
2. `.github/workflows/deploy.yml` を更新。
3. `unstable` ブランチを手動で作成（または初回の CI 実行で自動作成）。
4. `release` ブランチに、新しい URL を指す `@updateURL` 等を記述した最終版をプッシュ。
5. `README.md` のリンクを更新。
