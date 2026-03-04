## 1. 準備と定義

- [x] 1.1 `src/shortcuts.ts` に `toggleFavorite` ショートカットを定義する（キー: 'v'）
- [x] 1.2 `src/i18n.ts` に新しいショートカットのラベルと説明の翻訳を追加する

## 2. インフラストラクチャの更新

- [x] 2.1 `src/managers/InputManager.ts` のコンストラクタを更新し、`UIManager` を受け取るようにする
- [x] 2.2 `src/main.ts` で `InputManager` のインスタンス化時に `uiManager` を渡すように修正する

## 3. ショートカットアクションの実装

- [x] 3.1 `src/managers/InputManager.ts` の `_handleShortcutAction` に `toggleFavorite` アクションを追加する
- [x] 3.2 `src/managers/InputManager.ts` でモーダル表示中（特にメタデータモーダル）のショートカット挙動を調整する

## 4. 検証とテスト

- [x] 4.1 'v' キーでお気に入りがトグルされることを確認する
- [x] 4.2 ヘルプモーダルに新しいショートカットが表示されていることを確認する
- [x] 4.3 入力フィールドにフォーカスがある時にショートカットが無効化されることを確認する
- [x] 4.4 `npm run test` を実行して既存のテストが壊れていないか確認する
