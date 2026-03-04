## Context

現在のランダムジャンプ（Lucky Navigation）は、`Metadata.relatedWorks` と `SearchCache` に依存する同期的な `pickRandomWork` 関数（`src/logic.ts`）で完結しています。しかし、候補が枯渇した場合の能動的な補充（fetch を伴う非同期処理）が必要となり、既存の `UIManager` や `InputManager` に非同期ロジックが分散するリスクがあります。また、補充中の多重発火防止や UI のローディング表示など、状態管理の複雑さが増しています。

## Goals / Non-Goals

**Goals:**
- `DiscoveryManager` を導入し、検索・補充・抽選・ジャンプの責務を一元管理する。
- 候補不足時（閾値 5件未満）に、Deep Fetch およびタグ検索による補充を自動実行する。
- 補充中の状態（`isLuckyLoading`）を `Store` で管理し、UI（🎲ボタン）とショートカットでの多重発火を防止する。
- `src/logic.ts` は純粋関数としての責務を維持し、非同期処理（副作用）を Manager 層に分離する。

**Non-Goals:**
- ランダムジャンプ以外のナビゲーション（前後のページ移動など）への補充機能の導入。
- 検索キャッシュの永続化ロジックの大幅な変更（既存の `localStorage` 利用を維持）。
- 新しいサイトアダプターの追加。

## Decisions

### 1. DiscoveryManager の新設と責務の集約
- **理由**: `UIManager` と `InputManager` の両方から非同期の補充・ジャンプを実行する必要があるため、共通のインターフェースを提供します。
- **実装**: `App` クラスで初期化し、`UIManager` と `InputManager` に提供します。`UIManager` 内の `_performSearch` もこのクラスに移行し、検索機能のコアを担います。

### 2. Store への `isLuckyLoading` 状態の追加
- **理由**: 補充中であることを UI コンポーネント（`NavigationButtons`）に伝え、かつ `InputManager` でのキー入力をガードするためです。
- **実装**: `StoreState` に boolean 型で追加します。

### 3. 非同期補充のワークフロー
- **理由**: ユーザーの関心を維持しつつ、関連性の高い作品を提示するためです。
- **フロー**:
    1. `DiscoveryManager.jumpToRandomWork()` 発火。
    2. 現在の候補数をチェック（`logic.ts` のヘルパーを利用）。
    3. 5件未満なら `isLuckyLoading` を true にし、補充プロセス（Deep Fetch -> なければタグ検索）を実行。
    4. 補充完了後（または失敗後）、再度抽選を行い、結果があれば遷移。
    5. 最後に `isLuckyLoading` を false に戻す。

### 4. 補充ロジックの優先順位
- **Decision**: 1. 検索次ページ (Deep Fetch) -> 2. ランダムなタグの検索。
- **理由**: 現在の検索コンテキストがある場合は、その続きを見るのが最もユーザーの意図に近いと考えられます。タグ検索は最終手段としての「探索」として位置づけます。

## Risks / Trade-offs

- **[Risk] 無限ループや過剰な fetch** → **Mitigation**: 1回のジャンプ要求につき補充は最大1回（1ページ分）に制限します。また、`isLuckyLoading` によるガードを徹底します。
- **[Risk] fetch 失敗時の UX 低下** → **Mitigation**: fetch に失敗した場合や補充後も候補がゼロの場合は、既存のフォールバック（履歴を無視して抽選）を行い、遷移を試みます。
- **[Trade-off] DiscoveryManager の肥大化** → **Mitigation**: 通信とパースの詳細は `DiscoveryManager` で持ちますが、純粋なフィルタリングや抽選アルゴリズムは `src/logic.ts` に残し、テスタビリティを確保します。
