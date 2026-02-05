## 1. 型定義とStoreの拡張

- [x] 1.1 `src/types.ts` に `SearchCache` インターフェースを追加
- [x] 1.2 `src/store.ts` の `StoreState` に `searchQuery`, `searchCache` を追加
- [x] 1.3 `src/store.ts` の `STORAGE_KEYS` に検索関連のキーを追加
- [x] 1.4 `src/store.ts` の `setState` で検索状態を `localStorage` に永続化する処理を追加
- [x] 1.5 `src/store.ts` の `constructor` で `localStorage` から検索状態を復元する処理を追加

## 2. UIコンポーネントの修正

- [x] 2.1 `src/ui/components/SearchModal.ts` に `searchQuery` プロパティを追加し、入力フィールドに初期値をセット
- [x] 2.2 `src/ui/components/SearchModal.ts` に「更新中」を示す小さなインジケータ（Silent Fetch表示）を追加
- [x] 2.3 `src/ui/components/SearchModal.ts` の `onClose` で `searchResults: null` をセットしないように修正（リセットの責務をUIManagerに移譲）

## 3. UIManager での SWR ロジック実装

- [x] 3.1 `src/managers/UIManager.ts` で検索モーダルを開く際の初期化処理を修正
- [x] 3.2 キャッシュが存在する場合に即座に UI に反映させるロジックを追加
- [x] 3.3 有効期限（1時間）を判定し、期限切れの場合にバックグラウンドで `onSearch` を実行するロジックを追加
- [x] 3.4 検索実行時にキーワードを `Store` に保存する処理を追加

## 4. 動作検証と調整

- [x] 4.1 モーダルを閉じて再度開いた際に、結果が維持されていることを確認
- [x] 4.2 ページをリロード（または別の作品へ遷移）した際、検索キーワードが復元されることを確認
- [x] 4.3 ページリロード後、キャッシュから結果が即座に表示され、裏で更新されることを確認
- [x] 4.4 キャッシュが有効期限（テスト用に短縮設定）で正しく更新されることを確認
