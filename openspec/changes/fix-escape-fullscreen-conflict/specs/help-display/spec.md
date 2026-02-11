## MODIFIED Requirements

### Requirement: Closing Help Modal
ユーザーは、`?` キーまたは `Esc` キーの押下、モーダル外（オーバーレイ）のクリック、またはモーダル内の「閉じる」ボタンのクリックによって、ヘルプモーダルを閉じることができなければならない（MUST）。

#### Scenario: Close via '?' key
- **WHEN** ヘルプモーダルが表示されており、ユーザーが `?` キーを押下する
- **THEN** ヘルプモーダルが閉じられる

#### Scenario: Close via Escape key
- **WHEN** ヘルプモーダルが表示されており、ユーザーが `Esc` キーを押下する
- **THEN** ヘルプモーダルが閉じられる
- **AND** ブラウザのデフォルト挙動（フルスクリーンの解除等）は抑制される

#### Scenario: Close via clicking overlay
- **WHEN** ヘルプモーダルが表示されており、ユーザーがモーダル外の背景部分をクリックする
- **THEN** ヘルプモーダルが閉じられる

#### Scenario: Close via close button
- **WHEN** ヘルプモーダルが表示されており、ユーザーがモーダル内の「閉じる」ボタンをクリックする
- **THEN** ヘルプモーダルが閉じられる
