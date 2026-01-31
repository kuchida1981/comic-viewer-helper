## 1. GUI境界制限の実装

- [ ] 1.1 `src/ui/Draggable.js` に現在の位置をビューポート内に制限する `clampToViewport` メソッドを実装する
- [ ] 1.2 `src/ui/Draggable.js` のドラッグ中およびドラッグ終了時のロジックに `clampToViewport` を適用する
- [ ] 1.3 `src/main.js` の `App` クラスにおいて、`window.onresize` イベント時に `Draggable` インスタンスの境界チェックを呼び出すようにする

## 2. 不透明度制御（ホバー効果）の実装

- [ ] 2.1 `src/ui/styles.js` に GUI コンテナの基本透明度とホバー時の透明度、および遷移アニメーション（transition）のスタイルを定義する
- [ ] 2.2 `src/ui/components/NavigationButtons.js` 等の親コンテナ（GUI 全体）に不透明度制御用のクラスを適用する

## 3. 検証とテスト

- [ ] 3.1 ウィンドウサイズを縮小した際に GUI が画面外に消えず、適切に引き戻されることを確認する
- [ ] 3.2 マウスホバー時に GUI が不透明になり、離れると半透明になることを確認する
- [ ] 3.3 必要に応じて `Draggable.js` などの単体テストを更新し、境界制限ロジックを検証する
