## 1. 型定義の更新

- [x] 1.1 `src/store.js` の Metadata 型定義にタグの `type` プロパティを追加する
- [x] 1.2 `src/adapters/DefaultAdapter.js` の JSDoc 型定義を更新する

## 2. アダプター層の実装

- [x] 2.1 `DefaultAdapter.js` にタグ種別判定のヘルパー関数を追加する
- [x] 2.2 `getMetadata()` でタグ抽出時に `type` プロパティを付与する
- [x] 2.3 アダプターのテストを追加/更新する

## 3. UI層の実装

- [x] 3.1 `MetadataModal.js` でタグの `type` に応じたCSSクラスを付与する
- [x] 3.2 `styles.js` にタグ種別ごとの色定義を追加する

## 4. 動作確認

- [x] 4.1 ビルドして動作確認を行う
- [x] 4.2 各タグ種別の色を確認し、必要に応じて調整する
