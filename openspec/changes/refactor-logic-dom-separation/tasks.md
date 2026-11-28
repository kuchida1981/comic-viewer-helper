# Tasks

## 1. DOM 操作層の分離と純粋関数化

- [x] 1.1 `src/dom.ts` を新設し、`src/logic.ts` から DOM 操作関数（`cleanupDOM`, `fitImagesToViewport`, `applyRowLayout`, `getPairingInfo`, `revertToOriginal`, `getClickNavigationDirection`, `waitForImageLoad`, `forceImageLoad`, `preloadImages`, `triggerImageDecode`, `getImageElementByIndex`）を移動する
- [x] 1.2 `src/logic.ts` の `isEligibleForPairing` をエクスポートし、`getPrimaryVisibleImageIndex`・`getNavigationDirection`・`normalizeUrl` から DOM 型および `window` 参照を除去する
- [x] 1.3 `src/store.ts`、`src/managers/Navigator.ts`、`src/managers/InputManager.ts`、`src/managers/UIManager.ts` の import および `normalizeUrl` 呼び出しを更新する

## 2. ESLint ルールの強化と no-unnecessary-condition の解消

- [x] 2.1 `eslint.config.mjs` に `src/logic.ts` 向けの `no-restricted-globals`・`no-restricted-syntax`（DOM 型禁止）および `src/dom.ts` 向けの `import-x/no-restricted-paths` を追加する
- [x] 2.2 `eslint.config.mjs` から 4 ファイルの `@typescript-eslint/no-unnecessary-condition: "off"` を削除し、`src/logic.ts`, `src/dom.ts`, `src/ui/utils.ts`, `src/adapters/DefaultAdapter.ts`, `src/managers/Navigator.ts` のエラーを解消する

## 3. テストの再編とドキュメント・全体検証

- [x] 3.1 `src/logic.test.ts`・`src/logic.safety.test.ts`・`src/managers/Navigator.test.ts`・`src/managers/InputManager.test.ts`・`src/dom.test.ts` を分離後の構成に合わせて更新し、`src/logic.ts` のカバレッジ 100% を含め全テストがパスすることを確認する
- [x] 3.2 `AGENTS.md` の `src/logic.ts` に関する注記（#286 で分離予定の旨）を完了状態に合わせて更新する
- [x] 3.3 `make all`（`test`, `lint`, `typecheck`, `docs`, `build`）を実行し、すべてのチェックがエラーなしで完了することを確認する
