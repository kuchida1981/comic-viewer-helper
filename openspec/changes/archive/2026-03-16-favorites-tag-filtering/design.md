## Context
現在のお気に入りモーダルでは、タグをクリックすると外部検索が実行される。お気に入り作品が増えた際、モーダル内で特定のタグを持つ作品を素早く見つけるための絞り込み機能が必要である。

## Goals / Non-Goals

**Goals:**
- お気に入りモーダル内でのタグによる作品の絞り込み
- 複数タグのAND検索のサポート
- 選択状態の視覚的なフィードバック
- 純粋なロジックとDOM操作の分離

**Non-Goals:**
- 閲覧履歴（History）タブに対するフィルタリング（まずはお気に入りに限定）
- 外部サイト側での検索挙動の変更

## Decisions

### Decision 1: `src/logic.ts` へのロジック抽出
**選択**: `calculateTrends` を `logic.ts` に移動し、新たに `filterWorksByTags` を追加する。
**理由**: フィルタリングやトレンド計算は純粋なデータ処理であり、DOMに依存しないため、プロジェクトの規約に従い `logic.ts` でテスト可能にする。
**代替案**: `FavoritesModal.ts` 内にプライベート関数として保持する（テストが困難になるため却下）。

### Decision 2: `FavoritesModal.ts` での状態管理
**選択**: `createFavoritesModal` 内で `selectedTagTexts: Set<string>` を保持する。
**理由**: タグの選択状態はモーダルのライフサイクルに閉じているため、グローバルな `Store` ではなくローカルなクロージャ変数として管理するのが適切である。
**代替案**: `Store` に `selectedFavoriteTags` 状態を追加する（他のコンポーネントで参照する必要がないため冗長）。

### Decision 3: `UIManager.ts` の `_handleFavoritesTagClick` の変更
**選択**: `onTagClick` を通じて `UIManager` 側で外部検索を行うのではなく、`FavoritesModal` 内部でフィルタリングを完結させる。
**理由**: UIの即時応答性を高め、モーダルが閉じるのを防ぐため。

### Decision 4: CSSクラスの追加
**選択**: `src/ui/styles.ts` に `.comic-helper-tag-chip.active` を追加する。
**理由**: 既存の `COLORS` 定数を利用して、アクセントカラー（緑）でハイライトするため。

## Risks / Trade-offs
- [Risk] トレンドセクションからタグが消えると解除できなくなる → [Mitigation] トレンド計算の母数は常に全お気に入りとし、フィルタリング中も上位10件を表示し続ける。
- [Risk] 大量のお気に入り（数百件以上）でのパフォーマンス低下 → [Mitigation] 単純な `Set.has` と `Array.filter` による計算なので、通常の使用範囲では問題にならないと判断。
