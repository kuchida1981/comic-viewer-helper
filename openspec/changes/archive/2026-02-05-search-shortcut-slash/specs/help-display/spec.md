## MODIFIED Requirements

### Requirement: Help Content Display
ヘルプモーダルは、利用可能なすべてのキーボードショートカットとその説明を、現在の言語設定に応じた翻訳テキストで一覧形式で表示しなければならない（SHALL）。

#### Scenario: View shortcut list
- **WHEN** ヘルプモーダルが表示されている
- **THEN** ユーザーは `j/k` (ナビゲーション), `d` (見開きトグル), `o` (オフセット), `i` (情報), `f` (フルスクリーン), `/` (検索), `?` (ヘルプ) などの操作説明を確認できる

#### Scenario: 翻訳されたショートカット一覧の表示
- **WHEN** 日本語環境でヘルプモーダルが表示されている
- **THEN** ユーザーは「次のページへ移動」や「見開きモードのON/OFF」や「検索の開始」といった日本語の説明を確認できる
- **AND** 英語環境では、これらが英語（"Move to next page", "Toggle Fullscreen", "Start search" 等）で表示される
