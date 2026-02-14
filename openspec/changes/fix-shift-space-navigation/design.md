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

- **名前付きキー / Space**: 設定に `Shift+` プレフィックスがない場合、`e.shiftKey` が `false` であることを必須条件とします。
- **文字キー**: `e.key.length === 1` かつ `Space` でない場合、Shift キーの状態に関わらず `e.key` の一致のみを見ます（`?` 対応のため）。
- **`Shift+` プレフィックスあり**: 常に `e.shiftKey` かつ `e.key` の一致を見ます。

### 2. 回帰テストの追加
`InputManager.test.ts` に、`Space` と `Shift+Space` をシミュレートしたイベントを投げ、適切なメソッド（`scrollToImage(1)` / `scrollToImage(-1)`）が呼ばれることを確認するテストケースを追加します。

## Risks / Trade-offs

- **[Risk]** 文字キー判定の条件が複雑になり、特定のキーボードレイアウトで機能しなくなる可能性。
- **[Mitigation]** `e.key.length === 1` かつ `Space` 以外という条件は、ほとんどのブラウザの標準的な挙動に基づいているため、広範なテストでカバーします。
