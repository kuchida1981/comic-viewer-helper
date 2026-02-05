## 1. モックユーティリティの実装

- [x] 1.1 `src/test/mocks/dom.ts` を作成し、`createMockImage`（Pattern A）を実装する。オプション未指定プロパティがオブジェクトに存在しないようにする
- [x] 1.2 `src/test/mocks/dom.ts` に `createMockMouseEvent`（Pattern B）を実装する。戻り値は `{ event, stopImmediatePropagation, preventDefault }` とする
- [x] 1.3 `src/test/mocks/dom.ts` に `asNodeList` ヘルパーを実装する。配列を `NodeListOf<T>` にキャストする
- [x] 1.4 `src/test/mocks/dom.ts` に `setupLocationMock` を実装する。`Object.defineProperty` で `window.location` を標準的にモックする
- [x] 1.5 `src/test/mocks/store.ts` を作成し、`createMockStore`（Pattern B）を実装する。戻り値は `{ store, getState, setState, subscribe }` とする

## 2. テストファイルの移行

- [x] 2.1 `src/logic.test.ts` — `createMockImage` を適用し、全 `as unknown as HTMLImageElement` キャストを Factory 経由に置換する
- [x] 2.2 `src/logic.test.ts` — `fitImagesToViewport` テスト内の `querySelectorAll` モックを `vi.fn((selector: string) => ...)` + `asNodeList` に置換し、`(selector: any)` と `as any` 戻り値を排除する
- [x] 2.3 `src/logic.test.ts` — `jumpToRandomWork` テスト内の `window.location` モックを `setupLocationMock` に置換し、全 `@ts-expect-error` を排除する
- [x] 2.4 `src/logic.test.ts` — `(images[1] as any).decode` のようなアサート側キャストを、Factory外で保持した Mock 参照に置換する
- [x] 2.5 `src/managers/PopUnderBlocker.test.ts` — `createMockMouseEvent` を適用し、全 `as unknown as MouseEvent` キャストを排除する
- [x] 2.6 `src/managers/PopUnderBlocker.test.ts` — `createMockStore` を適用し、`as unknown as Store` キャストを排除する
- [x] 2.7 `src/managers/PopUnderBlocker.test.ts` — `setupLocationMock` を適用し、`Object.defineProperty` の重複記述と `@ts-expect-error` を排除する
- [x] 2.8 `src/i18n.test.ts` — `(MESSAGES.en as any)[topKey]` と `(MESSAGES.ja as any)[topKey]` のキャストを直接除去する

## 3. Lint 緩和の解除と検証

- [x] 3.1 `eslint.config.mjs` で テスト対象の `"@typescript-eslint/no-explicit-any": "off"` を `"warn"` に変更する
- [x] 3.2 `npm run lint` で警告がゼロであることを確認する
- [x] 3.3 `npm run test` で全テストが緑であることを確認する
- [x] 3.4 `npm run check-types` で型エラーがゼロであることを確認する