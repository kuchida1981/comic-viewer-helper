## Why

ユーザーが過去に閲覧した作品を振り返り、自分の好みの傾向（よく見るタグなど）を把握できるようにするためです。localStorage の容量制限を超えた大量のデータを安全に保存し、新しい作品との出会いをサポートする分析機能を提供します。

## What Changes

- **閲覧履歴の保存 (IndexedDB)**: 作品タイトル、タグ、閲覧日時を IndexedDB に保存する仕組みの導入。
- **傾向分析ロジック**: 保存された履歴からタグの出現頻度を集計し、ランキング化する機能。
- **履歴 UI の統合**: 検索モーダルを拡張し、タブ切り替えによって閲覧履歴と分析結果を表示できる UI の追加。
- **履歴からの検索/遷移**: 履歴一覧から作品ページへ直接遷移したり、特定のタグで再検索したりする機能。

## Capabilities

### New Capabilities
- `browsing-history`: 作品の閲覧履歴を永続化し、取得・削除を行う機能。
- `preference-analysis`: 履歴データに基づき、タグの頻度分析やランキング生成を行う機能。

### Modified Capabilities
- `search-interface`: 検索モーダルに履歴タブを追加し、表示内容を切り替えるための変更。

## Impact

- **Storage**: IndexedDB を新規採用（データベース名: `comic-viewer-helper-db` を想定）。
- **Affected Code**: `UIManager.ts`, `SearchModal.ts` (リファクタリングを含む), `Store.ts` (履歴関連状態の管理).
- **Architecture**: `HistoryManager` クラスの新設による関心の分離。
