## Why

閲覧対象の書籍画像は基本的に右開き（右から左へ進む）形式であるため、現在の「`<` = 前へ」「`>` = 次へ」という方向割り当ては読者の直感に反している。キーバインドの `ArrowRight`/`ArrowLeft` についても同様に直感に反する状態にある。

## What Changes

- GUIボタンの意味を反転：`<` / `<<` を「次へ」「最後へ」に、`>` / `>>` を「戻る」「最初へ」にする
- キーバインドの `ArrowRight` を「戻る」に、`ArrowLeft` を「次へ」に反転する
- `j`/`k`, `PageUp`/`PageDown`, `Space`/`Shift+Space` は変更しない
- ナビゲーション方向の割り当てを定数として管理し、将来の設定画面（#73）で切り替えられるよう設計する

## Capabilities

### New Capabilities
- (なし)

### Modified Capabilities
- `navigation-control`: キーボード操作のナビゲーション方向割り当てが変更される。`ArrowRight` が「前へ」、`ArrowLeft` が「次へ」になる。GUIボタンの表示文字列と動作のマッピングも反転する。

## Impact

- `src/ui/components/NavigationButtons.js`: GUIボタンの表示文字列と動作のマッピング
- `src/shortcuts.js`: `nextPage` / `prevPage` のキー定義（`ArrowRight`/`ArrowLeft` のみ移動）
- `src/managers/InputManager.js`: ホイールナビゲーション方向の判定（`logic.js` の変更に連携）
- `src/logic.js`: `getNavigationDirection` 関数のホイール方向の取り決め