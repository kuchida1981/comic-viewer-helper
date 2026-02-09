## 1. ESLint設定の更新

- [x] 1.1 `eslint.config.mjs` に `complexity` ルール（エラー, 閾値10）を追加する

## 2. ユーティリティのリファクタリング

- [x] 2.1 `src/ui/utils.ts` の `createElement` 関数を、属性・スタイル・イベント処理ごとのヘルパー関数に分割する
- [x] 2.2 リファクタリング後の `src/ui/utils.ts` がLintをパスすることを確認する

## 3. ロジックのリファクタリング

- [x] 3.1 `src/logic.ts` の `fitImagesToViewport` から、ペアリング判定ロジックを `calculatePairing` として切り出す
- [x] 3.2 `src/logic.ts` の `fitImagesToViewport` から、DOM操作ロジックを分離する
- [x] 3.3 `src/logic.ts` の `preloadImages` を簡素化・分割する
- [x] 3.4 関連するユニットテスト (`src/logic.test.ts`) を更新し、パスすることを確認する

## 4. InputManager のリファクタリング

- [x] 4.1 `src/managers/InputManager.ts` にショートカットコマンドマップを定義する
- [x] 4.2 `onKeyDown` メソッドを、コマンドマップを使用する形式に書き換える
- [x] 4.3 `handleWheel` や `onMouseUp` も必要に応じて分割し、複雑度を下げる
- [x] 4.4 `src/managers/InputManager.test.ts` を実行し、既存機能が維持されていることを確認する

## 5. UIManager のリファクタリング

- [x] 5.1 `src/managers/UIManager.ts` の `updateUI` メソッドを、`_ensureRootContainer`, `_initializeComponents`, `_updateComponents` などに分割する
- [x] 5.2 モーダル管理ロジックを `_handleModals` などのメソッドに切り出す
- [x] 5.3 検索ロジック `_performSearch` を整理し、複雑度を下げる
- [x] 5.4 `src/managers/UIManager.test.ts` を実行し、UI更新が正しく行われることを確認する

## 6. 最終確認

- [x] 6.1 `npm run lint` を実行し、すべてのファイルで複雑度エラーが発生しないことを確認する
- [x] 6.2 `npm run test` を実行し、全テストがパスすることを確認する
- [x] 6.3 `npm run build` を実行し、ビルドが成功することを確認する