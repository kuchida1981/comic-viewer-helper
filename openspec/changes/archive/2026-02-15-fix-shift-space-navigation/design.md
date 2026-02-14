## Context

`Space` キーによる次ページ遷移と `Shift+Space` キーによる前ページ遷移が、現在の `matchesShortcut` ロジックにおいて正しく区別されていません。
具体的には、`Shift+Space` を入力した際に `e.key` が `' '` (Space) となり、修飾キーの状態よりも先にキー値の一致で `nextPage` ショートカットにマッチしてしまいます。

## Goals / Non-Goals

**Goals:**
- `Space` と `Shift+Space` を厳密に区別し、それぞれ意図した方向にページ遷移するようにする。
- `?` のような、入力に Shift を必要とする文字キーのショートカット判定を破壊しない。
- `ArrowDown` などの「名前付きキー」においても、意図しない Shift 押下での誤判定を防ぐ。

**Non-Goals:**
- ショートカットキー自体の割り当て変更。
- `InputManager` 以外のナビゲーションロジックの修正。

## Decisions

### 1. `matchesShortcut` における判定ロジックの厳格化
名前付きキー（`Space` を含む）と文字キー（`?` 等）を区別して判定します。

コードレビュー（Gemini Code Assist）の指摘に基づき、ロジックの共通化と可読性向上を目的としたリファクタリングを行います。

- **共通処理**:
  - ショートカット文字列から `Shift+` プレフィックスの有無 (`wantsShift`) を判定し、`baseKey` および `expectedKey` を算出。
  - 最初に `e.key !== expectedKey` で早期リターン。
- **分岐処理**:
  - `wantsShift` が真の場合: `e.shiftKey` の一致を返す。
  - `wantsShift` が偽の場合:
    - 文字キー（`length === 1` かつ非Space）なら `true`。
    - 名前付きキーなら `!e.shiftKey` を返す。

### 2. 回帰テストの追加
`InputManager.test.ts` に、`Space` と `Shift+Space` をシミュレートしたイベントを投げ、適切なメソッド（`scrollToImage(1)` / `scrollToImage(-1)`）が呼ばれることを確認するテストケースを追加します。

## Risks / Trade-offs

- **[Risk]** 文字キー判定の条件が複雑になり、特定のキーボードレイアウトで機能しなくなる可能性。
- **[Mitigation]** `e.key.length === 1` かつ `Space` 以外という条件は、ほとんどのブラウザの標準的な挙動に基づいているため、広範なテストでカバーします。
