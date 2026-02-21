## 1. ロジックの拡張

- [ ] 1.1 `src/logic.ts` の `jumpToRandomWork` 関数を修正し、遷移候補が存在して遷移を試みた場合に `true`、候補がない場合に `false` を返すように変更する
- [ ] 1.2 `src/logic.test.ts` に `jumpToRandomWork` の戻り値に関するテストケースを追加する

## 2. ナビゲーターの修正

- [ ] 2.1 `src/managers/Navigator.ts` の `init` メソッドを修正し、初期化時に `isAutoplayEnabled` が `true` であれば `_startAutoplay()` を呼び出すようにする
- [ ] 2.2 `src/managers/Navigator.ts` の `_startAutoplay` メソッドを修正し、最終ページ到達時に `isAutoplayEnabled: false` にする代わりに `jumpToRandomWork()` を呼び出すように変更する
- [ ] 2.3 `jumpToRandomWork()` が `false` を返した場合（候補なし）にのみ、`isAutoplayEnabled: false` を設定してオートプレイを停止するロジックを実装する

## 3. 検証とテスト

- [ ] 3.1 `src/managers/Navigator.test.ts` のオートプレイ関連のテストを更新し、最終ページ到達時にランダムジャンプが試行されることを確認する
- [ ] 3.2 ページロード時にオートプレイが自動開始されることをテストで確認する
- [ ] 3.3 `npm run test`, `npm run lint`, `npm run check-types` を実行して、すべてのチェックがパスすることを確認する
