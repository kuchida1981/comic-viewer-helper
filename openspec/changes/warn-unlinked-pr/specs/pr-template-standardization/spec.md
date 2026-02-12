## ADDED Requirements

### Requirement: 標準PRテンプレートの提供
リポジトリは、プルリクエスト作成時に自動的に適用されるテンプレートファイル（`.github/pull_request_template.md`）を備えていなければならない（MUST）。

#### Scenario: PRテンプレートの自動適用
- **WHEN** ユーザーが新しいプルリクエストを作成しようとする
- **THEN** テンプレートの内容（背景、目的、イシュー番号、TODOリスト）が初期テキストとして入力欄に表示される
