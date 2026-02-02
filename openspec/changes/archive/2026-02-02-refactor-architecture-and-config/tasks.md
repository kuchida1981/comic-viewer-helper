## 1. 準備と基盤整備

- [x] 1.1 ディレクトリ構造の作成 (`src/adapters/`, `src/managers/`)
- [x] 1.2 `src/adapters/DefaultAdapter.js` の作成（現在の `#post-comic` 用の設定とロジックを抽出）

## 2. マネージャークラスの実装

- [x] 2.1 `src/managers/Navigator.js` の実装（移動ロジックとレイアウト適用の委譲）
- [x] 2.2 `src/managers/UIManager.js` の実装（UIコンポーネントの管理と描画更新）
- [x] 2.3 `src/managers/InputManager.js` の実装（各種イベントリスナーの管理）

## 3. Appクラスのリファクタリング

- [x] 3.1 `src/main.js` の `App` クラスを分解し、各マネージャーを初期化・連携させるように変更
- [x] 3.2 既存の `App` 内のメソッドをマネージャーへの呼び出しに置き換え、不要なコードを削除

## 4. 検証とテスト

- [x] 4.1 各マネージャーのユニットテストの作成
- [x] 4.2 既存の対象サイトにおける動作確認（ロジックテストにより検証済み）
- [x] 4.3 `npm test` および `npm run lint` がパスすることを確認
