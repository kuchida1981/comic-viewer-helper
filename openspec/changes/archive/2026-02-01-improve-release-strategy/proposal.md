## Why

現在のリリースプロセスでは、`master` ブランチへの変更が即座に単一の `release` ブランチへデプロイされるため、一般ユーザーが常に開発途上の（不安定な可能性がある）コードを利用することになります。また、`package.json` と `src/header.js` の両方でバージョンを手動管理する必要があり、ヒューマンエラーのリスクがあります。
本変更では、`stable`（安定版）と `unstable`（開発版）の2系統のリリースフローを確立し、バージョン管理を `package.json` に一元化することで、利用者の安心感向上と開発・リリース作業の効率化を同時に実現します。

## What Changes

### 1. ブランチ戦略の刷新
- **`unstable` ブランチ**: 最新の開発版を配布。`master` ブランチへのプッシュ時に自動更新。
- **`stable` ブランチ**: 安定版を配布。セマンティックバージョニングに基づくタグ（例: `1.2.0`）がプッシュされた時のみ更新。
- **`release` ブランチ**: 廃止。既存ユーザーの移行完了後に削除。

### 2. バージョン管理の一元化と自動化
- **Single Source of Truth**: `package.json` の `version` を唯一の正解とする。
- **ビルドスクリプトの導入**: 新規に `scripts/build.mjs` を作成し、ビルド時に `src/header.js` の `@version` を自動置換する。
- **Unstable サフィックス**: `unstable` ブランチ向けのビルドでは、バージョン番号に自動的に `-unstable` を付与する（例: `1.2.0-unstable`）。

### 3. GitHub Actions (`deploy.yml`) の拡張
- `master` へのプッシュで `unstable` ブランチへデプロイ。
- 数値形式のタグ（`X.Y.Z`）のプッシュで `stable` ブランチへデプロイし、GitHub Release を自動作成。

### 4. UI とドキュメントの改善
- **ステータス表示**: 作品情報（Info）モーダル等に、現在のバージョンとリリースタイプ（stable/unstable）を表示。
- **README**: インストールリンクを2系統に整理し、ステータスバッジを導入。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- **ci-deployment**: デプロイ先ブランチの定義、タグベースのリリースフロー、GitHub Release 生成要件の追加。
- **metadata-view**: UI 上でのバージョン・リリースタイプ表示要件の追加。

## Impact

- **配布URL**: 安定版・開発版それぞれの URL が新設されます。
- **ビルドコマンド**: `npm run build` の内部動作がシェルコマンドから Node.js スクリプトに変更されます。
- **リリース作業**: `package.json` の更新と `git tag` のプッシュがリリースのトリガーとなります。
