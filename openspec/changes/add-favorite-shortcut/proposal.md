## Why

マンガを閲覧中に、マウス操作なしで素早く作品をお気に入りに追加・解除できるようにするためです。お気に入り機能のアクセシビリティを高め、ユーザーがスムーズにコンテンツを管理できるようにします。

## What Changes

- キーボードショートカット 'v' (Favorite) を追加し、お気に入り状態をトグルできるようにします。
- ショートカット実行時に、ナビゲーションボタンのお気に入りアイコン（♡ / ♥）が即座に更新されるようにします。
- ヘルプモーダルのショートカット一覧に新しい項目を追加します。

## Capabilities

### New Capabilities
- `favorite-shortcut`: キーボード操作によるお気に入りの追加・解除機能。

### Modified Capabilities
- `favorites-management`: ショートカットによるトグル要件の追加。

## Impact

- `src/shortcuts.ts`: 新しいショートカット定義の追加。
- `src/managers/InputManager.ts`: ショートカットアクションの実装と `UIManager` への依存追加。
- `src/managers/UIManager.ts`: `_toggleFavorite` の外部（`InputManager`）からの呼び出し許可。
- `src/main.ts`: `InputManager` への `UIManager` インスタンスの注入。
