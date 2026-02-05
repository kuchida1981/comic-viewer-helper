# test-mock-utilities

## Purpose
テスト用モックユーティリティ（Factory関数・ヘルパー）を提供し、テストコード内の型安全モッキングの基盤とする。

## Requirements

### Requirement: HTMLImageElement モックの型安全な生成
システムは、`HTMLImageElement` のモックオブジェクトを生成するFactory関数（`createMockImage`）を `src/test/mocks/dom.ts` で提供しなければならない（SHALL）。オプション未指定のプロパティはオブジェクトに存在しないようにし、`'decode' in img` のような存在チェックが正確に動作する必要がある。戻り値の型は `HTMLImageElement` であり、テスト側で `as any` やキャストを行う必要がないものとする。

#### Scenario: オプション指定したプロパティのみが存在する
- **WHEN** `createMockImage({ complete: true, naturalHeight: 100 })` と呼び出す
- **THEN** 返されるオブジェクトは `complete` と `naturalHeight` を持ち、`decode` プロパティは存在しない

#### Scenario: decode モックを指定した場合はテスト側で直接参照可能
- **WHEN** `const decode = vi.fn(); const img = createMockImage({ decode })` と呼び出す
- **THEN** `decode` は `img` に付与され、テスト側で `expect(decode).toHaveBeenCalled()` で直接検証できる

### Requirement: MouseEvent モックの型安全な生成
システムは、`MouseEvent` のモックオブジェクトと検証用モック参照を一緒に返すFactory関数（`createMockMouseEvent`）を `src/test/mocks/dom.ts` で提供しなければらない（SHALL）。戻り値は `{ event, stopImmediatePropagation, preventDefault }` の型であり、テスト側で `as unknown as MouseEvent` キャストを行う必要がないものとする。

#### Scenario: デフォルト値で生成した場合のモック検証
- **WHEN** `const { event, preventDefault } = createMockMouseEvent({ target: someElement })` と呼び出し、イベントハンドラを実行する
- **THEN** `expect(preventDefault).toHaveBeenCalled()` で直接検証できる

#### Scenario: ctrlKey/metaKey オプションが正しく反映される
- **WHEN** `createMockMouseEvent({ target: el, ctrlKey: true })` と呼び出す
- **THEN** `event.ctrlKey` が `true` であり、`event.metaKey` がデフォルト値 `false` である

### Requirement: NodeList 互換ヘルパーの提供
システムは、配列を `NodeListOf<T>` の型として扱えるようにするヘルパー関数（`asNodeList`）を `src/test/mocks/dom.ts` で提供しなければならない（SHALL）。これにより `querySelectorAll` のモック戻り値で `as any` キャストが不要になる。

#### Scenario: 配列を NodeListOf として返す
- **WHEN** `vi.fn(() => asNodeList(elements))` で `querySelectorAll` モックの戻り値とする
- **THEN** テスト対象コードで `Array.from()` や `forEach()` で正常に動作し、型エラーが発生しない

### Requirement: window.location モックのユーティリティ
システムは、`window.location` を型安全に書き換えるためのユーティリティ関数（`setupLocationMock`）を `src/test/mocks/dom.ts` で提供しなければらない（SHALL）。`Object.defineProperty` を使用し、`@ts-expect-error` や `delete window.location` を必要としないものとする。

#### Scenario: デフォルト href で書き換え
- **WHEN** `setupLocationMock()` を呼び出す
- **THEN** `window.location.href` が `'http://localhost/'` となり、テスト内で読み書き可能になる

#### Scenario: 任意の href で書き換え
- **WHEN** `setupLocationMock('http://example.com/')` を呼び出す
- **THEN** `window.location.href` が `'http://example.com/'` となる

### Requirement: Store モックの型安全な生成
システムは、`Store` のモックオブジェクトとモック参照を一緒に返すFactory関数（`createMockStore`）を `src/test/mocks/store.ts` で提供しなければらない（SHALL）。戻り値は `{ store, getState, setState, subscribe }` の型であり、テスト側で `as unknown as Store` キャストを行う必要がないものとする。

#### Scenario: デフォルト状態で生成した場合の検証
- **WHEN** `const { store, getState } = createMockStore()` と呼び出し、`store.getState()` を実行する
- **THEN** デフォルトの `StoreState` が返され、`expect(getState).toHaveBeenCalled()` で検証できる

#### Scenario: 部分的な状態オーバーライドが反映される
- **WHEN** `createMockStore({ enabled: false })` と呼び出す
- **THEN** `store.getState().enabled` が `false` であり、その他のフィールドがデフォルト値である
