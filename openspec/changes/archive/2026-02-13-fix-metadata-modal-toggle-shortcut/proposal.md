## Why

Infoモーダルを開いた状態で 'i' キーを押してもモーダルが閉じないという、他のモーダル（検索やヘルプ）と非対称な動作を修正し、直感的な操作を可能にするため。

## What Changes

- `InputManager` において、`metadata` (iキー) ショートカットのハンドリングを、モーダルの状態に関わらず実行される `_handleToggleShortcuts` 内に移動します。
- これにより、Infoモーダルが表示されている間でも 'i' キーによってモーダルを閉じることが可能になります。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `metadata-view`: Infoモーダル（メタデータ表示）のトグル動作要件の修正

## Impact

- `src/managers/InputManager.ts`: キーイベントハンドリングのロジック変更
- `src/managers/InputManager.test.ts`: テストケースの追加・更新
