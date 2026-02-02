## 1. UI コンポーネントとスタイルの準備

- [x] 1.1 `src/ui/components/ProgressBar.js` を新規作成し、進捗表示の DOM 構造を定義する
- [x] 1.2 `src/ui/styles.js` にプログレスバー用のスタイルを追加する
- [x] 1.3 `src/ui/styles.js` に標準スクロールバーを非表示にするための `html.comic-helper-enabled` スタイルを追加する

## 2. 状態連動の実装

- [x] 2.1 `src/managers/UIManager.js` で `ProgressBar` コンポーネントを初期化する
- [x] 2.2 `UIManager.updateUI()` 内で、スクリプトの `enabled` 状態に応じて `html` 要素のクラスを切り替える処理を追加する
- [x] 2.3 `UIManager.updateUI()` 内で、`currentVisibleIndex` に基づいてプログレスバーの表示を更新するロジックを実装する

## 3. 検証と調整

- [x] 3.1 開発環境で動作確認を行い、スクロールバーが消えてもナビゲーションが機能することを確認する
- [x] 3.2 様々なページ数やズームレベルでプログレスバーの進捗表示が正確であることを確認する
- [x] 3.3 単ページ表示と見開き表示の両方でレイアウトが崩れないことを確認する
