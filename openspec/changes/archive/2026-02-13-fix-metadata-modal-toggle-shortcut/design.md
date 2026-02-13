## Context

現在の `InputManager` では、ショートカットの処理順序により、Infoモーダル（metadata）が開いている間は `metadata` アクション（'i' キー）が無視されています。これは `_handleShortcutAction` が実行される前に `_isAnyModalOpen()` によるガードが入っているためです。

一方、ヘルプや検索モーダルは `_handleToggleShortcuts` 内で個別にトグル処理が行われており、モーダルが開いている状態でもキー入力を受け取ることができます。

## Goals / Non-Goals

**Goals:**
- Infoモーダルを 'i' キーで閉じることができるようにする。
- 他のトグル可能なモーダル（ヘルプ、検索）と実装パターンを統一する。

**Non-Goals:**
- モーダル以外のショートカット（ページ移動など）をモーダル表示中に有効にすること。

## Decisions

### 1. `metadata` ショートカットのトグル処理を `_handleToggleShortcuts` へ移動
`_handleToggleShortcuts` はモーダルの表示状態に関わらず（ガードの前に）呼び出されるため、ここに `metadata` の処理を追加することで、表示中に 'i' キーを押した場合でも `isMetadataModalOpen` 状態を反転させることができます。

- **Rationale**: 既存の `help` や `search` と同様のパターンを採用することで、コードの可読性と保守性を維持する。
- **Alternative**: `_isAnyModalOpen()` のガード条件を緩和して `metadata` だけ通すようにすることも可能だが、個別のトグルメソッドに切り出したほうが責務が明確になる。

## Risks / Trade-offs

- **Risk**: 入力フィールド（検索バーなど）で 'i' を入力した際にモーダルが閉じてしまう。
- **Mitigation**: `onKeyDown` の冒頭にある `isInputField` チェックにより、入力フィールド内でのショートカットは既に抑制されているため、問題ない。
