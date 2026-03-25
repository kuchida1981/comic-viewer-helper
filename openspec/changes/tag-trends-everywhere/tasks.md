## 1. 基礎（Store と Logic）の拡張

- [ ] 1.1 `src/store.ts` の `STORAGE_KEYS` に `WORK_TAGS_CACHE` を追加する
- [ ] 1.2 `StoreState` に `workTagsCache: Record<string, Tag[]>` を追加する
- [ ] 1.3 `Store` クラスに `workTagsCache` の読み込みと永続化のロジックを実装する
- [ ] 1.4 `src/logic.ts` のタグ集計・フィルタリングロジックが `workTagsCache` を考慮できるように（必要があれば）調整する

## 2. 共通コンポーネント `TrendSection` の作成

- [ ] 2.1 `src/ui/components/TrendSection.ts` を新設し、`FavoritesModal.ts` から `createTrendSection` を抽出・汎用化する
- [ ] 2.2 `TrendSection` が外部からの作品リストとフィルタリング用のコールバックを受け取れるように設計する

## 3. `TagFetchManager` の実装

- [ ] 3.1 `src/managers/TagFetchManager.ts` を作成し、順次フェッチのキュー管理ロジックを実装する
- [ ] 3.2 ページフェッチ間に 500ms のディレイを挿入するレート制限を実装する
- [ ] 3.3 タグ取得ごとに `Store` の `workTagsCache` を更新する処理を追加する
- [ ] 3.4 `DefaultAdapter.ts` のメタデータ取得ロジックを、`Document` を受け取れるようにリファクタリングする

## 4. 各 UI モーダルへの統合

- [ ] 4.1 `SearchModal.ts` に `TrendSection` を組み込み、検索結果に対するトレンド表示と絞り込みを有効にする
- [ ] 4.2 `FavoritesModal.ts` の履歴タブに `TrendSection` を組み込み、閲覧履歴に対するトレンド表示と絞り込みを有効にする
- [ ] 4.3 `MetadataModal.ts` の関連作品リストに `TrendSection` を組み込み、関連作品に対するトレンド表示と絞り込みを有効にする
- [ ] 4.4 `UIManager.ts` で `TagFetchManager` を初期化し、各モーダル表示時にフェッチを開始するように統合する

## 5. 検証とテスト

- [ ] 5.1 `TagFetchManager` のユニットテストを作成する
- [ ] 5.2 `TrendSection` の表示と絞り込み動作を各モーダルで確認する
- [ ] 5.3 タグ情報が `GM_storage` に正しく永続化されていることを確認する
