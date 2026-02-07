## Why

現在、メタデータモーダルに表示されるタグは外部サイトへの直接リンクとなっており、クリックすると現在のビューアを離れてしまいます。
ユーザーがビューアを離れることなく、特定のタグやジャンルに関連する作品を内部検索機能で素早く見つけられるようにすることで、サイトの回遊性と利便性を向上させます。

## What Changes

- **MetadataModal の改善**: タグクリック時に外部サイトへ遷移する代わりに、内部検索を実行するコールバック（`onTagClick`）を追加します。
- **検索コンテキストの保持**: `SearchResultsState` に検索タイプ（キーワード、タグ、ジャンルなど）と表示用ラベルを保持する機能を追加します。
- **検索 UI の更新**: `SearchModal` の結果表示部分に、現在の検索条件（例：「タグ: [タグ名]」）を表示するようにします。
- **UIManager の拡張**: タグベースの検索（特定の URL パターンへの遷移）を内部検索フローとして統合し、キャッシュ管理も適切に行えるようにします。

## Capabilities

### New Capabilities
- `internal-tag-navigation`: メタデータモーダルのタグから直接内部検索を起動し、そのコンテキストを管理する機能。

### Modified Capabilities
- `metadata-view`: タグがクリック可能になり、内部検索をトリガーするように要件を変更。
- `search-interface`: 検索結果に「何で検索したか」のコンテキストを表示する要件を追加。
- `search-results-display`: 検索タイプに応じた結果表示のカスタマイズ（ラベル表示など）をサポート。

## Impact

- `src/types.ts`: `SearchResultsState` インターフェースの拡張。
- `src/ui/components/MetadataModal.ts`: タグのイベントハンドリング追加。
- `src/ui/components/SearchModal.ts`: ヘッダー表示ロジックの変更。
- `src/managers/UIManager.ts`: 検索実行ロジック（`_performSearch`）の拡張。
