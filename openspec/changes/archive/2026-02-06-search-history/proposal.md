## Why

検索モーダルにおいて、過去に入力した検索クエリを再利用したいという要望があります。同じキーワードで繰り返し検索する際の手間を削減し、検索体験を向上させる必要があります。

## What Changes

- **検索履歴の永続化**: 検索実行時にクエリを `localStorage` に保存します（最新3件まで）。
- **重複排除ロジック**: クエリの正規化（トリミング、小文字化、単語のソート）により、意味的に同じクエリ（例：「a b」と「b a」）は重複とみなして集約します。
- **履歴表示 UI**: 検索モーダルの入力フィールド下に履歴を表示し、ワンクリックで再検索を可能にします。
- **件数制限の柔軟性**: 最大保存件数を定数として定義し、将来的な変更を容易にします。

## Capabilities

### New Capabilities
- `search-history`: 検索履歴の管理、永続化、および UI 表示。

### Modified Capabilities
- `search-interface`: 検索モーダルへの履歴表示セクションの追加。
- `state-management`: 検索履歴を管理するためのストア状態の拡張。

## Impact

- `src/store.ts`: `StoreState` への `searchHistory` の追加と `localStorage` 連携。
- `src/managers/UIManager.ts`: 検索実行時の履歴更新ロジックの追加。
- `src/ui/components/SearchModal.ts`: 履歴表示 UI の追加。
- `src/ui/styles.ts`: 履歴ボタン等のスタイル追加。
- `src/i18n.ts`: 履歴関連の多言語対応。
