## 1. 型定義の更新

- [x] 1.1 `src/global.d.ts` の `relatedWorks` 型に `isPrivate?: boolean` を追加
- [x] 1.2 `src/store.js` の JSDoc `Metadata` typedef に `isPrivate?: boolean` を追加

## 2. アダプター層の実装

- [x] 2.1 `src/adapters/DefaultAdapter.js` の `relatedWorks` 構築箇所で、タイトルの先頭が「非公開」であれば `isPrivate: true`、そうでなければ `isPrivate: false` を付与する

## 3. ランダム遷移のフィルタリング

- [x] 3.1 `src/managers/UIManager.js` の `onLucky` ハンドラで、`metadata.relatedWorks` から `isPrivate` でないものだけを抽選対象とする

## 4. テスト・検証

- [x] 4.1 既存テストが全て緑であることを確認
- [x] 4.2 `npm run lint` と `npm run check-types` が通ることを確認
