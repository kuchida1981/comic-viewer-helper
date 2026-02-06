## 1. 準備とベースラインの確認

- [ ] 1.1 現状のテスト実行とパスの確認
- [ ] 1.2 異常系（null/未定義）をシミュレートするためのテストケースの雛形作成

## 2. src/logic.ts の堅牢性向上

- [ ] 2.1 `getPrimaryVisibleImageIndex` への防御的チェック追加とテスト
- [ ] 2.2 `fitImagesToViewport` への防御的チェック追加とテスト
- [ ] 2.3 `cleanupDOM` および `revertToOriginal` への安全性向上
- [ ] 2.4 `waitForImageLoad`, `forceImageLoad`, `preloadImages` へのメソッド存在確認の追加

## 3. src/ui/utils.ts およびその他の改善

- [ ] 3.1 `createElement` における属性・イベント設定時の安全な型チェック追加
- [ ] 3.2 UIManager 等、DOM 要素を直接操作する箇所への Optional Chaining の適用

## 4. 最終検証

- [ ] 4.1 全ユニットテストの実行とパスの確認
- [ ] 4.2 ビルドおよびリンターの実行確認
