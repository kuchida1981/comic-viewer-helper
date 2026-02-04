## 1. 実装

- [x] 1.1 `src/managers/Navigator.js` の `scrollToImage` で、オーバーフロー判定ブロック（`targetIndex >= imgs.length` の条件分岐）を見開き調整ブロックの直後かつクランプの直前に移動する
- [x] 1.2 移動後のオーバーフロー判定で、`prospectiveTargetImg` の参照（現在はオーバーフロー判定より後で取得）が正しく動作するよう、変数の取得位置を調整する

## 2. 検証

- [x] 2.1 見開き表示で最終ページペアの「次へ」操作でメタデータモーダルが表示されることを確認（単一画像表示でも引き続き正常に動作することも確認）
- [x] 2.2 全チェック・テスト・バイルドが緑になることを確認 (`npm run test`, `npm run lint`, `npm run check-types`, `openspec validate --strict --all`, `IS_UNSTABLE=true npm run build`)
