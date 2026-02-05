## 1. スタイルの追加

- [x] 1.1 `src/ui/styles.ts` に検索モーダル専用のローディング・オーバーレイとスピナーのスタイルを追加する

## 2. SearchModal コンポーネントの改修

- [x] 2.1 検索結果エリア（`resultsSection`）を包むラッパー要素と `spinnerOverlay` 要素を実装する
- [x] 2.2 `setUpdating` メソッドを拡張し、オーバーレイの表示切り替えと入力要素（`input`, `submitBtn`）の無効化を実装する
- [x] 2.3 検索フォームの `submit` ハンドラに `e.stopPropagation()` を追加する
- [x] 2.4 ページングボタンの `click` ハンドラに `e.stopPropagation()` を追加する
- [x] 2.5 `content` コンテナ全体に対してクリックイベントの伝搬を阻止するリスナーを追加する

## 3. UIManager の修正

- [x] 3.1 `src/managers/UIManager.ts` の `_performSearch` メソッドを修正し、すべての検索開始時に `setUpdating(true)` を呼び出 すようにする

## 4. 動作確認

- [x] 4.1 検索およびページング実行中にローディングが表示されることを確認する
- [x] 4.2 検索実行中にフォームが無効化されることを確認する
- [x] 4.3 検索モーダル内をクリックしても背面の画像が移動しないことを確認する
