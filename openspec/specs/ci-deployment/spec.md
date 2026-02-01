# ci-deployment Specification

## Purpose
TBD - created by archiving change improve-build-artifact-management. Update Purpose after archive.
## Requirements
### Requirement: 配布用ブランチへの自動デプロイ
システムは、開発状況に応じた適切な配布用ブランチへ、ビルド成果物を自動的にデプロイしなければならない（SHALL）。

#### Scenario: unstable ブランチへのデプロイ
- **WHEN** `master` ブランチにコミットがプッシュされる
- **THEN** バージョン番号に `-unstable` が付与された状態でビルドされ、成果物が `unstable` ブランチにデプロイされる

#### Scenario: stable ブランチへのデプロイ
- **WHEN** セマンティックバージョニング形式（例: `1.2.0`）のタグがプッシュされる
- **THEN** タグ名をバージョン番号としてビルドされ、成果物が `stable` ブランチにデプロイされる
- **AND** GitHub Release が自動的に作成され、成果物が添付される

### Requirement: インストールURLの最新化
配布用ブランチ（`stable` および `unstable`）のビルド成果物は、利用者の選択に応じて Raw URL 経由で提供されなければならない（SHALL）。また、各成果物に含まれるメタデータ（`@updateURL`, `@downloadURL`）は、自身が配置されているブランチを正しく指していなければならない（SHALL）。

#### Scenario: 安定版のインストール
- **WHEN** ユーザーが `stable` ブランチの成果物の Raw URL にアクセスする
- **THEN** 最後にタグ付けされた安定版のスクリプトがインストールできる
- **AND** そのスクリプトの更新確認先 URL は `stable` ブランチを指している

#### Scenario: 開発版のインストール
- **WHEN** ユーザーが `unstable` ブランチの成果物の Raw URL にアクセスする
- **THEN** 最新の開発版（`master` ブランチの最新状態）のスクリプトがインストールできる
- **AND** そのスクリプトの更新確認先 URL は `unstable` ブランチを指している

