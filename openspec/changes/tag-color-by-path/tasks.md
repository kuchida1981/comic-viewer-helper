## 1. 型定義の更新

- [ ] 1.1 `src/store.js` の Metadata 型定義にタグの `type` プロパティを追加する
- [ ] 1.2 `src/adapters/DefaultAdapter.js` の JSDoc 型定義を更新する

## 2. アダプター層の実装

- [ ] 2.1 `DefaultAdapter.js` にタグ種別判定のヘルパー関数を追加する
- [ ] 2.2 `getMetadata()` でタグ抽出時に `type` プロパティを付与する
- [ ] 2.3 アダプターのテストを追加/更新する

## 3. UI層の実装

- [ ] 3.1 `MetadataModal.js` でタグの `type` に応じたCSSクラスを付与する
- [ ] 3.2 `styles.js` にタグ種別ごとの色定義を追加する

## 4. 動作確認

- [ ] 4.1 ビルドして動作確認を行う
- [ ] 4.2 各タグ種別の色を確認し、必要に応じて調整する
