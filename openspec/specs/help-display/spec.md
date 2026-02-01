# help-display

## Purpose
このスペックは、コミックビューアのヘルプ画面（キーボードショートカット一覧）の表示、制御、およびコンテンツ管理に関する要件を定義します。

## Requirements
### Requirement: Help Display Initiation
システムは、ユーザーがキーボードの `?` キーを押下するか、GUI上のヘルプボタンをクリックした際に、ヘルプモーダルを表示しなければならない（SHALL）。

#### Scenario: Open help via keyboard
- **WHEN** ユーザーが `?` キーを押下する
- **THEN** ヘルプモーダルが表示される

#### Scenario: Open help via GUI button
- **WHEN** ユーザーがナビゲーションパネルの `?` ボタンをクリックする
- **THEN** ヘルプモーダルが表示される

### Requirement: Help Content Display
ヘルプモーダルは、利用可能なすべてのキーボードショートカットとその説明を、現在の言語設定に応じた翻訳テキストで一覧形式で表示しなければならない（SHALL）。

#### Scenario: View shortcut list
- **WHEN** ヘルプモーダルが表示されている
- **THEN** ユーザーは `j/k` (ナビゲーション), `d` (見開きトグル), `o` (オフセット), `i` (情報), `?` (ヘルプ) などの操作説明を確認できる

#### Scenario: 翻訳されたショートカット一覧の表示
- **WHEN** 日本語環境でヘルプモーダルが表示されている
- **THEN** ユーザーは「次のページへ移動」や「見開きモードのON/OFF」といった日本語の説明を確認できる
- **AND** 英語環境では、これらが英語（"Move to next page" 等）で表示される

### Requirement: Closing Help Modal
ユーザーは、`?` キーまたは `Esc` キーの押下、モーダル外（オーバーレイ）のクリック、またはモーダル内の「閉じる」ボタンのクリックによって、ヘルプモーダルを閉じることができなければならない（MUST）。

#### Scenario: Close via '?' key
- **WHEN** ヘルプモーダルが表示されており、ユーザーが `?` キーを押下する
- **THEN** ヘルプモーダルが閉じられる

#### Scenario: Close via Escape key
- **WHEN** ヘルプモーダルが表示されており、ユーザーが `Esc` キーを押下する
- **THEN** ヘルプモーダルが閉じられる

#### Scenario: Close via clicking overlay
- **WHEN** ヘルプモーダルが表示されており、ユーザーがモーダル外の背景部分をクリックする
- **THEN** ヘルプモーダルが閉じられる

#### Scenario: Close via close button
- **WHEN** ヘルプモーダルが表示されており、ユーザーがモーダル内の「閉じる」ボタンをクリックする
- **THEN** ヘルプモーダルが閉じられる
