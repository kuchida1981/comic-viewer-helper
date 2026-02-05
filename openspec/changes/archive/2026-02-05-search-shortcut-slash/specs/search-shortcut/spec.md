## ADDED Requirements

### Requirement: Search shortcut activation
システムは、ユーザーがキーボードの `/` キーを押下した際に、検索モーダルを表示しなければならない（SHALL）。

#### Scenario: Open search via shortcut
- **WHEN** ユーザーが `/` キーを押下する
- **THEN** 検索モーダルが表示される

### Requirement: Search shortcut suppression
システムは、ユーザーがテキスト入力フィールドにフォーカスしている間、またはメタキー（Ctrl, Alt, Meta）を同時に押下している間は、`/` キーによる検索開始を抑制しなければならない（SHALL）。

#### Scenario: Ignore shortcut in input field
- **WHEN** ユーザーが `input` 要素にフォーカスしている状態で `/` キーを押下する
- **THEN** 検索モーダルは表示されず、標準の文字入力が行われる
