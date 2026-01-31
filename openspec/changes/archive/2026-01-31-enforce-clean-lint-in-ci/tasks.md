## 1. 静的解析の強化

- [x] 1.1 `package.json` の `lint` スクリプトを更新し `--max-warnings 0` を追加

## 2. 既存の警告の解消

- [x] 2.1 `src/main.js` から未使用関数 `getCurrentPageIndex` を削除

## 3. 検証

- [x] 3.1 `npm run lint` を実行し、終了コードが 0 であることを確認
- [x] 3.2 意図的に警告を発生させ（例：未使用変数の追加）、`npm run lint` が失敗することを確認
