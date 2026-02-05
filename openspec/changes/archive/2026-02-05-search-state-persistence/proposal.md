## Why
現在、検索モーダルを閉じると検索結果が破棄され、ページ遷移後も状態が維持されないため、連続して検索結果を利用する際のユーザー体験が損なわれている。これを改善するため、検索状態の永続化とキャッシュ機構（SWRパターン）を導入する。

## What Changes
- 検索キーワードおよび検索結果を `Store` で永続的に保持し、モーダル閉鎖時にリセットしないように変更。
- 検索キーワードと検索結果（取得日時を含む）を `localStorage` に保存し、ページ遷移やリロード後も復元可能にする。
- 検索モーダルを開いた際、有効期限内のキャッシュがあれば即座に表示し、期限切れの場合は背景で最新データを取得（SWR）する仕組みを導入。

## Capabilities

### New Capabilities
- `search-cache-management`: 検索結果のキャッシュ有効期限管理とバックグラウンド更新（SWR）の要件。

### Modified Capabilities
- `search-interface`: 検索キーワードの自動復元と初期状態の制御。
- `search-results-display`: キャッシュ利用時の即時表示とバックグラウンド更新の振る舞い。
- `state-management`: 検索関連の状態（クエリ、結果、タイムスタンプ）の永続化。

## Impact
- `src/store.ts`: `StoreState` の拡張と `localStorage` への同期。
- `src/managers/UIManager.ts`: モーダル開閉時の検索復元・SWRロジック。
- `src/ui/components/SearchModal.ts`: 初期クエリの受け入れと表示。
