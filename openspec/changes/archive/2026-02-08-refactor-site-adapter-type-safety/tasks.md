## 1. 型定義と Type Guard の導入

- [x] 1.1 `src/types.ts` に `SearchableAdapter` インターフェースを追加する
- [x] 1.2 `src/types.ts` に `MetadataAdapter` インターフェースを追加する
- [x] 1.3 `src/types.ts` に `isSearchableAdapter` Type Guard 関数を実装する
- [x] 1.4 `src/types.ts` に `isMetadataAdapter` Type Guard 関数を実装する

## 2. 呼び出し側のリファクタリング

- [x] 2.1 `src/managers/UIManager.ts` の `_performSearch` で `isSearchableAdapter` を使用し、`!` を除去する
- [x] 2.2 `src/main.ts` の `init` で `isMetadataAdapter` を使用し、安全に `getMetadata` を呼び出すように変更する

## 3. テストコードの改善

- [x] 3.1 `src/adapters/DefaultAdapter.test.ts` 内の `!` アサーションを可能な限り除去し、Type Guard を使用した安全な記述に変更する

## 4. 検証

- [x] 4.1 `npm run check-types` を実行し、型エラーがないことを確認する
- [x] 4.2 `npm run test` を実行し、既存のテストがすべてパスすることを確認する
- [x] 4.3 `npx openspec validate --strict --all` を実行し、OpenSpec の整合性を確認する
