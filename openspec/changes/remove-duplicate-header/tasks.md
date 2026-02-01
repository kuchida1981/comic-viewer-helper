## 1. 実装の準備

- [ ] 1.1 `src/main.js` の現在の内容とヘッダ範囲を再確認する
- [ ] 1.2 `src/header.js` の内容が `src/main.js` のヘッダと同期されていることを最終確認する

## 2. 実装

- [ ] 2.1 `src/main.js` から UserScript ヘッダブロック（`// ==UserScript==` 〜 `// ==/UserScript==`）を削除する
- [ ] 2.2 ファイルの先頭が `import` 文から始まるように整形する

## 3. 検証

- [ ] 3.1 `npm run lint` を実行し、ヘッダ削除による静的解析エラーが発生しないことを確認する
- [ ] 3.2 `npm test` を実行し、すべてのユニットテストがパスすることを確認する
- [ ] 3.3 `npm run build` を実行し、`dist/comic-viewer-helper.user.js` に正しく1つだけヘッダが含まれていることを確認する
