## ADDED Requirements

### Requirement: UI Panel Interaction
ユーザーは GUI パネルを操作して設定の変更や機能の呼び出しができる必要があります（SHALL）。

#### Scenario: Toggle Fullscreen
- **WHEN** UIパネルの「全画面」ボタンをクリックする
- **THEN** ブラウザ（またはコンテナ内の擬似画面）がフルスクリーン状態に切り替わる

### Requirement: Metadata Modal Display
ユーザーはメタデータモーダルを表示して、作品情報を確認できる必要があります（SHALL）。

#### Scenario: Opening metadata modal
- **WHEN** UIパネルの「情報」アイコンをクリックする
- **THEN** 作品タイトルやタグを含むモーダルオーバーレイが表示される
