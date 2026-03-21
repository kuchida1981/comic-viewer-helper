## 1. 環境設定と要件の更新

- [ ] 1.1 `openspec/specs/unit-testing/spec.md` にカバレッジ 100% 強制の要件を追加する
- [ ] 1.2 `vitest.config.mjs` を更新し、`src/logic.ts` に対して 100% のカバレッジ閾値を設定する
- [ ] 1.3 `npm test` を実行し、カバレッジ不足によりテストが失敗することを確認する

## 2. テストケースの追加とカバレッジ達成

- [ ] 2.1 `src/logic.safety.test.ts` に `fitImagesToViewport` のエッジケーステストを追加する
- [ ] 2.2 `src/logic.safety.test.ts` に `waitForImageLoad` の `null` 引数テストを追加する
- [ ] 2.3 `src/logic.safety.test.ts` に `forceImageLoad` / `triggerImageDecode` のモック要素テストを追加する
- [ ] 2.4 全テストを実行し、`src/logic.ts` のカバレッジが 100% に達し、テストがパスすることを確認する

## 3. 最終確認

- [ ] 3.1 `make all` を実行し、全てのチェック（Lint, TypeCheck, OpenSpec, Build）がパスすることを確認する
