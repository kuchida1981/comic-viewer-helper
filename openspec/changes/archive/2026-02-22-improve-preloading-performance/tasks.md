## 1. Navigator の拡張

- [x] 1.1 `Navigator.ts` にプリロード枚数を算出するプライベートメソッド `_getPreloadCount()` を追加する
- [x] 1.2 `Navigator.ts` にプリロードを実行するプライベートメソッド `_triggerPreload()` を追加し、`_getPreloadCount()` を利用するように実装する
- [x] 1.3 `Navigator.ts` の `applyLayout` および `updatePageCounter` 内の直接的な `preloadImages` 呼び出しを `_triggerPreload()` に置き換える

## 2. ロジックの微調整（オプション）

- [x] 2.1 `src/logic.ts` の `preloadImages` の実装を確認し、外部からの `count` 指定が正しく動作することを確認する（必要に応じてリファクタリング）

## 3. テストの追加と検証

- [x] 3.1 `Navigator.test.ts` に、表示モードやオートプレイ設定に応じたプリロード枚数の計算を検証するテストケースを追加する
- [x] 3.2 高速オートプレイ設定時に `preloadImages` がより大きな引数で呼ばれることをモックを使用して検証する

## 4. 最終確認

- [x] 4.1 `npm run test` で全テストがパスすることを確認する
- [x] 4.2 `npx openspec validate` で仕様との整合性を確認する
