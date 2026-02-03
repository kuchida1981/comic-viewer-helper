## 1. テスト修正

- [x] 1.1 `src/managers/Navigator.test.js` に `scrollToEdge` の非同期化に対応するためのセットアップコードを追加する
- [x] 1.2 `scrollToEdge` でロード済み画像へ移動する場合のテストケースを追加する
- [x] 1.3 `scrollToEdge` で未ロード画像へ移動する場合（ロード待機が発生するケース）のテストケースを追加する

## 2. 実装修正

- [x] 2.1 `src/managers/Navigator.js` の `scrollToEdge` メソッドを `async` に変更する
- [x] 2.2 `scrollToEdge` 内で `forceImageLoad` と `waitForImageLoad` を使用して画像ロードを制御するロジックを実装する
- [x] 2.3 `scrollToEdge` 内でロード完了後に `applyLayout` を呼び出し、スクロールを実行する処理を実装する

## 3. 動作確認

- [x] 3.1 `npm test` を実行し、既存テストおよび追加したテストが通過することを確認する
- [x] 3.2 ビルドコマンドを実行し、エラーが発生しないことを確認する
