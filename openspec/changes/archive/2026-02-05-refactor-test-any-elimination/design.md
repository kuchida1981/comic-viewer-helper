## Context

イシュー #116 で全テストファイルから `@ts-nocheck` を排除した際、モック生成箇所に `as any` やボイラープレート的な記述が残存した。現在 `eslint.config.mjs` がテスト対象で `no-explicit-any` を `off` にしているため、静的に検出されない。本変更では、モックの生成パターンをFactoryに抽象化し、Lint緩和を解除するanovice全を目標とする。

## Goals / Non-Goals

**Goals:**
- テストコード内の明示的な `any` 使用をゼロにする
- `window.location` モックの方法を `Object.defineProperty` に統一し、`@ts-expect-error` を排除する
- `src/test/mocks/` に再利用可能なFactory/ユーティリティを導入し、各テスト間の重複を削減する
- `eslint.config.mjs` の緩和を解除し、テスト対象も本番コードと同等の静的解析に適用する

**Non-Goals:**
- 本番コード（テスト外の `src/` ファイル）の変更は行わない
- `as unknown as` パターン自体の廃止（HTMLImageElementのような複雑なインターフェースに対するモックでは現実的に必要）
- テスト構造やカバレッジの拡張

## Decisions

### 1. Factory のパターン選択（Pattern A vs B）

テスト側で「型としての値」と「Mock としての参照」を同時に必要とするため、2つのパターンを用途に応じて分けた。

| Factory | パターン | 理由 |
|---|---|---|
| `createMockImage` | A（戻り値は型のみ） | 配列で大量生成するパターンが支配的。Pattern B では `{ image, mocks }` の配列になりコード量が増える |
| `createMockMouseEvent` | B（戻り値にモック参照同伴） | 毎テスト1件だけ生成し、`stopImmediatePropagation`/`preventDefault` を必ず検証する。Destructure で簡潔 |
| `createMockStore` | B（戻り値にモック参照同伴） | `getState` の戻り値を途中で変える必要がある。モック参照を直接掴んでいて変更が簡単 |

### 2. `createMockImage` のオプション設計

テスト側で `'decode' in img` が `false` になる場合があるため、オプション未指定のプロパティはオブジェクトに存在しないようにする。スプレッド・オブジェクトリテラルで実装し、`undefined` チェックではなくキーの有無で判定を可能にする。

### 3. `querySelectorAll` モックの型問題の解決

`vi.mocked(container.querySelectorAll).mockImplementation(...)` では、`querySelectorAll` のオーバーロード型が展開されて `selector` パラメータが複雑な型になる。対策として、モック本体を `vi.fn((selector: string) => ...)` で直接定義し、`vi.mocked()` を経由しない。戻り値は `asNodeList()` ヘルパーで配列を `NodeListOf<T>` にキャストする。

### 4. `setupLocationMock` の実装

`delete window.location` + 再代入は `@ts-expect-error` を必要とする。`PopUnderBlocker.test.ts` で既に使われている `Object.defineProperty` に統一し、`writable: true, configurable: true` で書き込みを許可する。

### 5. `i18n.test.ts` の `as any` 除去

`topKey` は `keyof typeof MESSAGES.en`（`'ui' | 'shortcuts'`）で正しく型付けられているため、`(MESSAGES.en as any)[topKey]` のキャストは不要。直接 `MESSAGES.en[topKey]` で動く。

## Risks / Trade-offs

- [`as unknown as` は残存する] → `HTMLImageElement` のような巨大インターフェースを部分的にモックする際には不可避。ただしFactoryの内部に閉じ込め、テスト側では露出しない。
- [Lint緩和解除で見落としがある場合] → `npm run lint` で全件検出される。緩和解除は最後に行い、残存する `any` を視認してから対応する。
- [`asNodeList` は実装が不完全な NodeList を返す] → 実際に使われる操作（`Array.from`, `forEach`）は配列が満たすため実用上の問題ない。`item()` や数値インデックスアクセスは未実装だが、テスト対象コードでは使われない。
