# Tasks: 内部検索機能のUI/UX改善

## 実装

- [x] 1. `src/managers/UIManager.ts` の `_performSearch` を修正
    - [x] 検索開始時に `searchResults: null` をセットして表示をクリアする
    - [x] タグ検索時に `searchQuery` を更新しないように条件分岐を調整する
- [x] 2. `src/ui/components/SearchModal.ts` を修正
    - [x] 検索モーダル作成時に `searchContext` を考慮して `input.value` を決定する
- [x] 3. `src/managers/UIManager.test.ts` にテストを追加
    - [x] 検索開始時に結果がクリアされることを検証
    - [x] タグ検索時に `searchQuery` が維持されることを検証

## 検証

- [x] 4. 手動テストでの確認
    - [x] タグクリック時に前回の結果が残らないこと（チラつきの解消）
    - [x] タグ検索時に入力欄が空になること
    - [x] モーダルを閉じて再表示しても入力欄が期待通りであること
