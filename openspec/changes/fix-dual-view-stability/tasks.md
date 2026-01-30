## 1. Refactoring & Logic Cleanup

- [x] 1.1 `CONTAINER_SELECTOR` を `logic.js` から削除し、引数で受け取るように修正する（または `main.js` と共通化する）
- [x] 1.2 `logic.js` に `cleanupDOM` 関数を実装し、既存のラッパー要素を削除して画像をフラットに戻す処理を追加する
- [x] 1.3 `fitImagesToViewport` の冒頭で `cleanupDOM` を呼び出すように修正する

## 2. Core Logic Update

- [x] 2.1 `fitImagesToViewport` の引数を `(alignmentIndex)` から `(spreadOffset)` に変更する（`alignmentIndex` ロジックの完全廃止）
- [x] 2.2 `spreadOffset` (0/1) に基づいてペアリングを行う決定論的ロジックに書き換える
- [x] 2.3 `logic.test.js` を更新し、新しい `spreadOffset` ロジックのテストケースを追加する（`alignmentIndex` 関連のテストは削除）

## 3. UI & Integration

- [x] 3.1 `main.js` に `spreadOffset` 変数を追加し、状態管理を行う
- [x] 3.2 `toggleDualView` 関数内で、現在ページに基づいて初期 `spreadOffset` を決定するロジックを実装する
- [x] 3.3 `createNavigationUI` に「Adjust」ボタンを追加し、クリック時に `spreadOffset` をトグルして再描画する処理を実装する
- [x] 3.4 `resize` および `load` イベントリスナー修正：`fitImagesToViewport` 呼び出し時に現在の `spreadOffset` を正しく渡す

## 4. Verification

- [x] 4.1 ビルド (`npm run build`) が通ることを確認する
- [x] 4.2 テスト (`npm test`) が全てパスすることを確認する
- [ ] 4.3 ブラウザでの動作確認：見開きON時に意図したペアリングになるか、Adjustボタンでズレを修正できるか、リサイズしても設定が維持されるか確認する