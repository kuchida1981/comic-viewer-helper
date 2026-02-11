## Why

フルスクリーン表示中に検索モーダルやメタデータモーダルを開いた状態で `Escape` キーを押すと、モーダルが閉じずにフルスクリーンが解除されてしまう不具合を解消するため。
検索モーダルの入力欄にフォーカスがある場合でも、アプリ側で `Escape` キーを捕捉してモーダルを閉じる処理を優先させる必要があります。

## What Changes

- `InputManager.onKeyDown` において、入力欄フォーカス判定よりも先にモーダルを閉じるショートカットの処理を実行するように変更。
- モーダルが開いている間は、`Escape` キーによるデフォルト挙動（ブラウザのフルスクリーン解除など）を `preventDefault()` で抑制し、アプリ内でのモーダルクローズを優先する。

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
- `help-display`: `Escape` キーによるクローズ時のデフォルト挙動抑制を追加。
- `metadata-view`: `Escape` キーによるクローズ時のデフォルト挙動抑制を追加。
- `search-interface`: 入力欄フォーカス時でも `Escape` キーでクローズ可能であることを明記し、デフォルト挙動抑制を追加。

## Impact

- `src/managers/InputManager.ts`: キーイベントハンドラのロジック変更。
- `src/managers/InputManager.test.ts`: 修正を確認するためのテストケースの追加。
