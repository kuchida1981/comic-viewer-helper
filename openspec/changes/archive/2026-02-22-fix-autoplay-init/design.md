## Context

`Navigator` クラスの `init` メソッドでは、`Store` の状態変更を購読（subscribe）しており、状態が変化した際に `_startAutoplay` や `_stopAutoplay` を呼び出しています。しかし、初期化時点（ページロード時）における `isAutoplayEnabled` の値をチェックしてオートプレイを開始する処理が存在しません。そのため、リロード後や別ページへの遷移後にオートプレイが自動的に開始されない問題が発生しています。

## Goals / Non-Goals

**Goals:**
- ページロード完了時に `Store` の `enabled` と `isAutoplayEnabled` が共に `true` であれば、ユーザー操作なしにオートプレイを開始する。
- ページ遷移（リロードを伴う）後もオートプレイ設定が維持され、継続して閲覧できるようにする。

**Non-Goals:**
- オートプレイの基本ロジック（タイマー処理、ページ送り処理）自体の変更。

## Decisions

- **Decision:** `Navigator.init` メソッドの末尾に、初期状態チェックロジックを追加する。
  - **Rationale:** 既存の `subscribe` 内のロジックは状態変化時のみ発火するため、初期化時の状態を反映させるには明示的な呼び出しが必要であるため。
  - 具体的には、`enabled` と `isAutoplayEnabled` が共に `true` の場合に限り、`_startAutoplay()` を呼び出す。

## Risks / Trade-offs

- **Risk:** ページロード直後に意図せずページが進む可能性がある。
  - **Mitigation:** ユーザーが意図してオートプレイを有効にしている設定（`localStorage` に保存されている）に基づく動作であるため、許容される挙動とする。
