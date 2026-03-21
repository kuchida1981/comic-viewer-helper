## 1. 基盤の実装

- [ ] 1.1 `src/types.ts` に同期設定 (`SyncConfig`) の型定義を追加
- [ ] 1.2 `src/managers/SyncManager.ts` の作成と `SyncProvider` インターフェースの定義
- [ ] 1.3 `GistSyncProvider` を実装し、`GM_xmlhttpRequest` を用いた Gist API 通信を実装
- [ ] 1.4 `SyncManager` にデバウンス処理付きのアップロードロジックを実装

## 2. Store への統合

- [ ] 2.1 `src/store.ts` に `syncConfig` 状態を追加し、初期化時に `GM_getValue` から読み込む
- [ ] 2.2 `Store._persistChanges` 内で `SyncManager` を呼び出すフックを追加
- [ ] 2.3 `Store` 初期化時に `SyncManager.pull()` を実行し、リモートデータを適用するロジックを実装

## 3. UI の実装

- [ ] 3.1 `src/ui/components/SyncSettings.ts` (仮) の作成、または `HelpModal.ts` への同期設定項目の追加
- [ ] 3.2 PAT と Gist ID の入力フォーム、および最新の同期ステータス（日時、エラー等）の表示を実装

## 4. 権限とテスト

- [ ] 4.1 `src/header.ts` に `@grant GM_xmlhttpRequest` および `@connect github.com` を追加
- [ ] 4.2 `SyncManager` および `GistSyncProvider` の単体テストを作成
- [ ] 4.3 `Store` との連携テストを作成
