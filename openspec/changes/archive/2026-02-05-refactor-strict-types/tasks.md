## 1. store.ts — 動的キーアクセスの型安全化

- [x] 1.1 `setState` に汎用ヘルパー関数 `applyPatch<K extends keyof StoreState>` を追加し、キーと値の型対応を静的に束縛する
- [x] 1.2 `for...in` ループを `Object.keys(patch)` に置換し、各キーについて `applyPatch` を呼び出す
- [x] 1.3 行60の `@ts-expect-error` コメントを削除し、コンパイルエラーが発生しないことを確認する

## 2. i18n.ts — any キャストの削除とナローイング導入

- [x] 2.1 `result` と `fallback` の型を `any` から `unknown` に変更する
- [x] 2.2 ループ内のキーアクセスを `typeof` チェックと `Record<string, unknown>` キャストによるナローイングに変更する
- [x] 2.3 行114・116の `eslint-disable-next-line @typescript-eslint/no-explicit-any` コメントを削除する
- [x] 2.4 フォールバック動作（英語辞書へのフォールバック・キー名返却）が変わっていないことを確認する

## 3. UIManager.ts — 重複インターフェース定義の排除

- [x] 3.1 `PowerButton.ts` で `PowerButtonComponent` インターフェースが export されていることを確認する
- [x] 3.2 他のコンポーネント実装ファイルについも同様に export 状況を確認し、重複があればインポートに統一する
- [x] 3.3 `UIManager.ts` の行18-21のローカル `PowerButtonComponent` インターフェース定義を削除し、`PowerButton.ts` からのインポートに変更する

## 4. 検証

- [x] 4.1 `npm run test` で既存テストがすべて通過することを確認する
- [x] 4.2 `npm run lint` でリント警告・エラーがないことを確認する
- [x] 4.3 `npm run check-types` で型エラーがないことを確認する
- [x] 4.4 `openspec validate --strict --all` で全チャンジのバリデーションが通ることを確認する
- [x] 4.5 `IS_UNSTABLE=true npm run build` でビルドが成功することを確認する
