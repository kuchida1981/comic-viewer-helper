## Why

`Shift+Space` キーによる「前ページへスクロール」が正しく動作せず、「次ページへスクロール」が実行されてしまう問題を修正します。
これは `matchesShortcut` ロジックにおいて、`Space` キーと `Shift+Space` キーを正しく区別できていないことが原因です。

## What Changes

- `InputManager.ts` 内の `matchesShortcut` 関数を修正し、`Space` や `ArrowDown` などの名前付きキーにおいて Shift キーの状態を厳密にチェックするようにします。
- 一方で、`?` などの文字キーについては、Shift キーの有無に関わらず文字（`e.key`）が一致すればマッチするように維持します。
- 回帰テストを追加し、`Space` と `Shift+Space` が意図した通りに別々のショートカットとして認識されることを保証します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `navigation-control`: キーボードショートカットによるページ移動の信頼性を向上させます。

## Impact

- `src/managers/InputManager.ts`: ショートカット判定ロジックの変更
- `src/managers/InputManager.test.ts`: `Space` および `Shift+Space` の判定テストの追加
