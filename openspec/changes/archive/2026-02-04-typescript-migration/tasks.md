## 1. ツールチェーンと環境のセットアップ

- [x] 1.1 `typescript-eslint` 関連のパッケージをインストールする
- [x] 1.2 `tsconfig.json` を更新し、`.ts` ファイルを適切に処理できるように設定する
- [x] 1.3 `eslint.config.mjs` を TypeScript 対応に更新する
- [x] 1.4 `vite.config.mjs` と `vitest.config.mjs` のエントリポイントや設定を `.ts` 対応に微調整する

## 2. 共通ユーティリティと型定義の移行

- [x] 2.1 `src/global.d.ts` の内容を整理し、共有インターフェースとして再定義する
- [x] 2.2 `src/i18n.js` を `src/i18n.ts` に移行し、型安全な翻訳関数を実装する
- [x] 2.3 `src/ui/utils.js` を `src/ui/utils.ts` に移行し、`createElement` の型定義を適用する
- [x] 2.4 `src/ui/styles.js` を `src/ui/styles.ts` に移行する

## 3. コアロジックとマネージャーの移行

- [x] 3.1 `src/store.js` を `src/store.ts` に移行し、`StoreState` などの型を適用する
- [x] 3.2 `src/adapters/DefaultAdapter.js` を `src/adapters/DefaultAdapter.ts` に移行する
- [x] 3.3 `src/managers/` 以下の各マネージャー（Navigator, UIManager, etc.）を `.ts` に移行する
- [x] 3.4 `src/logic.js` と `src/shortcuts.js` を `.ts` に移行する

## 4. UI コンポーネントの移行

- [x] 4.1 `src/ui/Draggable.js` を `src/ui/Draggable.ts` に移行する
- [x] 4.2 `src/ui/components/` 以下の各コンポーネントを段階的に `.ts` に移行する

## 5. エントリポイントと最終調整

- [x] 5.1 `src/header.js` を `src/header.ts` にリネームする
- [x] 5.2 `src/main.js` を `src/main.ts` に移行する
- [x] 5.3 `scripts/build.mjs` を修正し、`.ts` 化されたヘッダーやモジュールを正しくビルド・結合できるようにする
- [x] 5.4 全てのテスト (`*.test.js` -> `*.test.ts`) を移行し、テストが正常にパスすることを確認する
- [x] 5.5 `package.json` の `main` フィールドやスクリプト設定を最終確認する