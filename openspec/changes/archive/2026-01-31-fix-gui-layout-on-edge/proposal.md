## Why

GUI（ナビゲーションパネル）をブラウザの画面端にドラッグした際、ブラウザのデフォルトのレイアウト挙動によってコンテナの幅が圧縮され、内部のボタンやテキストが折り返されて表示が崩れる問題を修正するため。

## What Changes

- GUIコンテナのスタイルに `white-space: nowrap` を追加し、テキストの折り返しを禁止します。
- GUIコンテナに `flex-wrap: nowrap` を追加し、ボタンなどのFlexアイテムが改行されないようにします。
- GUIコンテナに `width: max-content` （または相当の最小幅確保）を適用し、画面端でもコンテンツに応じた幅を維持するようにします。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `navigation-control`: 画面端でのレイアウト維持に関する要件の追加。

## Impact

- `src/main.js` の `createNavigationUI` 関数におけるGUIコンテナのスタイル定義。
