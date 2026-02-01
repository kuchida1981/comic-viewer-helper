## ADDED Requirements

### Requirement: Centralized Shortcut Management
システムは、すべてのキーボードショートカットの定義（キー、修飾キー、説明文）を一元管理しなければならない（SHALL）。これにより、ヘルプモーダルとイベントハンドラの双方が同一のデータソースを参照することを保証する。

#### Scenario: Update shortcut definition
- **WHEN** 開発者が一元管理されているデータ構造に新しいショートカットを追加する
- **THEN** ヘルプモーダルの一覧とキーボードイベントハンドラの両方に変更が反映される

### Requirement: Help Activation Shortcut
システムは、ヘルプ画面を即座に表示/非表示するためのキーボードショートカットを提供しなければならない（SHALL）。

#### Scenario: Toggle help with '?' key
- **WHEN** ユーザーが `?` キーを押下する
- **THEN** ヘルプモーダルの表示状態がトグルされる（表示 ↔ 非表示）
