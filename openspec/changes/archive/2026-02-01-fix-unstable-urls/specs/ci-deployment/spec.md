## MODIFIED Requirements

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
