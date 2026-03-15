## 1. 基盤の準備

- [x] 1.1 `src/header.ts` の `@grant` を `none` から `GM_setValue`, `GM_getValue`, `GM_deleteValue` に更新する
- [x] 1.2 `src/global.d.ts` に `GM_setValue`, `GM_getValue`, `GM_deleteValue` の型定義を追加する
- [x] 1.3 `src/test/mocks/gm_storage.ts` を作成し、`GM_storage` 関数のモックを実装する

## 2. ストレージ移行の実施

- [x] 2.1 `src/store.ts` の `localStorage` 利用箇所を `GM_setValue`, `GM_getValue` に置き換える
- [x] 2.2 `src/store.ts` の永続化ロジックにおいて、設定項目（enabled等）のホスト名プレフィックスを削除しグローバル化する（デザイン決定に基づく）
- [x] 2.3 `src/managers/ResumeManager.ts` の `localStorage` 利用箇所を `GM_setValue`, `GM_getValue`, `GM_deleteValue` に置き換える

## 3. テストの修正と検証

- [x] 3.1 `src/store.test.ts` を修正し、`localStorage` モックの代わりに `GM_storage` モックを使用するように変更する
- [x] 3.2 `src/managers/ResumeManager.test.ts` を修正し、`localStorage` モックの代わりに `GM_storage` モックを使用するように変更する
- [x] 3.3 全てのユニットテストを実行し、パスすることを確認する (`npm run test`)
- [x] 3.4 リンターと型チェックを実行し、エラーがないことを確認する (`npm run lint`, `npm run check-types`)
- [x] 3.5 ビルドを実行し、正常に終了することを確認する (`npm run build`)
- [x] 3.6 OpenSpec の検証を実行する (`npx openspec validate --strict --all`)
