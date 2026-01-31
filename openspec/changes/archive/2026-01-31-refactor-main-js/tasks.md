## 1. 基礎準備と状態管理の実装

- [x] 1.1 `src/store.js` の作成（状態保持、永続化、通知ロジック）
- [x] 1.2 `src/store.test.js` の作成と Store クラスの単体テスト
- [x] 1.3 `src/ui/utils.js` (DOM要素生成ユーティリティ `createElement`) の作成とテスト
- [x] 1.4 CSS 定数の定義と `<style>` タグ注入ロジックの整理

## 2. UI コンポーネントの構築

- [x] 2.1 `src/ui/components/PowerButton.js` の作成
- [x] 2.2 `src/ui/components/PageCounter.js` の作成
- [x] 2.3 `src/ui/components/SpreadControls.js` (Toggle & Adjust) の作成
- [x] 2.4 `src/ui/components/NavigationButtons.js` の作成
- [x] 2.5 `src/ui/Draggable.js` (ドラッグロジック) の抽出と実装

## 3. main.js の再構築 (App Manager への移行)

- [x] 3.1 `main.js` からのグローバル変数の削除と `Store` への移行
- [x] 3.2 状態変更時の通知 (`store.subscribe`) に基づく UI 更新とレイアウト適用の統合
- [x] 3.3 `createNavigationUI` を新コンポーネントを用いた実装に差し替え
- [x] 3.4 イベントハンドラ（keydown, wheel, resize）の App Manager への集約

## 4. 最終検証

- [x] 4.1 既存の `logic.test.js` がパスすることを確認
- [x] 4.2 UI コンポーネントの基本動作テストの実行
- [x] 4.3 実機（Tampermonkey等）を想定したビルドと動作確認
