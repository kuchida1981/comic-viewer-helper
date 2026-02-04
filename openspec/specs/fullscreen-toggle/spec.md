# fullscreen-toggle Specification

## Purpose
TBD - created by archiving change fullscreen-toggle. Update Purpose after archive.
## Requirements
### Requirement: Fullscreen Toggle via Keyboard
システムは、ユーザーが `f` キーを押下した際に、ブラウザのフルスクリーン表示をトグルしなければらない（SHALL）。フルスクリーン切り替えは Fullscreen API を経由し、対象は `document.documentElement`（ページ全体）とする。

#### Scenario: フルスクリーン入場
- **WHEN** ユーザーが `f` キーを押下する
- **AND** ブラウザが現在フルスクリーン表示されていない
- **THEN** ブラウザがフルスクリーン表示になる

#### Scenario: フルスクリーン退場
- **WHEN** ユーザーが `f` キーを押下する
- **AND** ブラウザが現在フルスクリーン表示されている
- **THEN** ブラウザがフルスクリーン表示から復元される

#### Scenario: Escape キーによるフルスクリーン退場
- **WHEN** ブラウザが現在フルスクリーン表示されている
- **AND** ユーザーが `Escape` キーを押下する
- **THEN** ブラウザがフルスクリーン表示から復元される（ブラウザのデフォルト動作）

### Requirement: Fullscreen API 非対応時の Graceful Degradation
Fullscreen API が利用できない環境では、`f` キー押下は静的に無視し、エラーは発生しなければならない（SHALL）。

#### Scenario: 非対応ブラウザでの キー押下
- **WHEN** ユーザーが `f` キーを押下する
- **AND** ブラウザが Fullscreen API をサポートしていない
- **THEN** 何も動作しず、エラーも表示されない

### Requirement: モーダル開時の操作制限
モーダルが開いている期間中、`f` キーによるフルスクリーン切り替えは無視されなければならない（SHALL）。

#### Scenario: ヘルプモーダル開時
- **WHEN** ヘルプモーダルが表示されている
- **AND** ユーザーが `f` キーを押下する
- **THEN** フルスクリーン切り替えは実行されない

#### Scenario: 情報モーダル開時
- **WHEN** 情報モーダルが表示されている
- **AND** ユーザーが `f` キーを押下する
- **THEN** フルスクリーン切り替えは実行されない

