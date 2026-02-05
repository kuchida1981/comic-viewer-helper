## Why

イシュー #116 で `@ts-nocheck` を全排除した際に、テストコード内に一時的に許容した `as any` キャストやボイラープレート的なモック記述が残存している。現時点で `eslint.config.mjs` がテストファイルに対して `no-explicit-any` を `off` に緩和しているため、これらは静的に検出されない。モックユーティリティの導入とLint緩和の解除により、テストコードの型安全性を本番コードと同等レベルに引き上げる。

## What Changes

- `src/test/mocks/dom.ts` を新規作成し、以下のFactory / ユーティリティを提供する：
  - `createMockImage` — `HTMLImageElement` モックのFactory（Pattern A: 戻り値は型のみ）
  - `createMockMouseEvent` — `MouseEvent` モックのFactory（Pattern B: モック参照を戻り値に同伴）
  - `asNodeList` — 配列を `NodeListOf<T>` に型キャストするヘルパー
  - `setupLocationMock` — `window.location` を `Object.defineProperty` で標準的にモックする
- `src/test/mocks/store.ts` を新規作成し、`createMockStore`（Pattern B）を提供する
- `logic.test.ts` — `createMockImage`, `asNodeList`, `setupLocationMock` を適用し、全 `as any` と `@ts-expect-error` を排除する
- `PopUnderBlocker.test.ts` — `createMockMouseEvent`, `createMockStore`, `setupLocationMock` を適用し、全 `as unknown as` と `@ts-expect-error` を排除する
- `i18n.test.ts` — `(MESSAGES.en as any)[topKey]` を直接除去（キャスト不要）
- `eslint.config.mjs` — テスト対象の `no-explicit-any: "off"` を `"warn"` へ変更し、緩和を解除する

## Capabilities

### New Capabilities
- `test-mock-utilities`: テスト用モックユーティリティ（Factory関数・ヘルパー）の提供と型安全モッキングの基盤

### Modified Capabilities
- `unit-testing`: テストコード内のモック記述が型安全なユーティリティに統一され、`any` キャストが排除される
- `linting`: テストファイルに対する `no-explicit-any` の緩和が解除され、本番コードと同等の静的解析が適用される

## Impact

- 影響ファイル: `eslint.config.mjs`, `src/logic.test.ts`, `src/managers/PopUnderBlocker.test.ts`, `src/i18n.test.ts`
- 新規ファイル: `src/test/mocks/dom.ts`, `src/test/mocks/store.ts`
- 既存モック `src/test/mocks/storage.ts` は変更なし
- 本番コード（`src/` 以下のテスト外ファイル）の変更なし
