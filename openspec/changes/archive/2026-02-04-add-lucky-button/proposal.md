## Why

読了後や気分転換に、関連作品リストの中から手軽に次の作品を選べるようにすることで、ユーザーの回遊性と利便性を向上させます。

## What Changes

- ナビゲーションUIに「おすすめ（ランダム）」ボタン（🎲アイコン）を追加します。
- ボタンクリック時、メタデータの `relatedWorks` リストからランダムに1つの作品を選択し、そのページへ遷移します。
- 関連作品が存在しないページでは、ボタンを表示しないか、または無効化することで、無効な操作を防ぎます。
- 多言語対応（日本語・英語）を含みます。

## Capabilities

### New Capabilities
- `lucky-navigation`: 関連作品からランダムに1つを選択して遷移する機能の要件。

### Modified Capabilities
- なし

## Impact

- `src/i18n.js`: 翻訳テキストの追加。
- `src/ui/components/NavigationButtons.js`: 新しいボタンのUI実装。
- `src/managers/UIManager.js`: ランダム遷移ロジックの実装と、データの有無による表示制御。
