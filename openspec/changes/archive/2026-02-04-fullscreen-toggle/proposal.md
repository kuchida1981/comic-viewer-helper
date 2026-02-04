## Why

コミックビューアで漫画を読む際に、ブラウザのアドレスバーやタスクバーが視界を占有し、読書体験を妨げる。「f」キー一つでブラウザをフルスクリーンに切り替えられることで、読書の集中度と閲覧面積の両方が改善される。

## What Changes

- `"f"` キー押下によるフルスクリーン入場・退場のトグル機能を追加する
- `shortcuts.js` に `"f"` キーのショートカット定義を追加する
- `InputManager.js` に Fullscreen API を使ったトグル実行ロジックを追加する
- ヘルプモーダルのショートカット一覧に `"f"` キーの説明が自動で表示される

## Capabilities

### New Capabilities
- `fullscreen-toggle`: ブラウザのフルスクリーン切り替え機能。キー押下で Fullscreen API を経由してフルスクリーンのON/OFFを制御する。

### Modified Capabilities
- `help-display`: ヘルプモーダルの表示されるショートカット一覧に、新規の `f` キー（フルスクリーン切り替え）が含まれるようになる。

## Impact

- `src/shortcuts.js`: ショートカット定義に `fullscreen` エントリを追加
- `src/managers/InputManager.js`: `onKeyDown` に `fullscreen` キー判定と Fullscreen API 呼び出しを追加
- `src/i18n.js`: フルスクリーン操作のラベル・説明文を追加
- Fullscreen API の対応は主流ブラウザで標準だが、非対応環境では graceful degradation が必要