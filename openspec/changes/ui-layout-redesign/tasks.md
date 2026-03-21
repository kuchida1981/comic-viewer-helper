## 1. スタイルの定義と調整

- [ ] 1.1 `src/ui/styles.ts` に `.comic-helper-row` クラスを追加し、`#comic-helper-ui` を `flex-direction: column` に変更する。
- [ ] 1.2 行間のギャップやパディングを調整し、2行になってもコンパクトに見えるようにする。
- [ ] 1.3 `flex-wrap: wrap` を追加してレスポンシブな挙動を有効にする。

## 2. コンポーネントのリファクタリング

- [ ] 2.1 `src/ui/components/NavigationButtons.ts` を修正し、ボタンを `navElements` と `utilElements` の2つのグループで返すようにする。
- [ ] 2.2 `NavigationButtons.ts` 内の `Info` テキストを ℹ️ アイコンに、`?` を ❓ アイコンに変更する。
- [ ] 2.3 各ボタンの `title`（ツールチップ）が正しく設定されていることを確認する。

## 3. UIManager の更新

- [ ] 3.1 `src/managers/UIManager.ts` の `_ensureRootContainer` を修正し、内部に `topRow` と `bottomRow` を作成するロジックを追加する。
- [ ] 3.2 `_ensureMainControls` と `_addNavigationButtons` を修正し、生成した要素を適切な行（`row`）に追加するように変更する。
- [ ] 3.3 再描画（`updateUI`）時に要素が重複して追加されないようにクリーンアップ処理を確認・修正する。

## 4. 動作確認とテスト

- [ ] 4.1 `npm run test` を実行し、既存のテストが壊れていないことを確認する。
- [ ] 4.2 必要に応じて UI コンポーネントのテスト（`NavigationButtons.test.ts` 等）を更新する。
- [ ] 4.3 `npx openspec validate --strict --all` を実行して、実装がスペックに準拠しているか確認する。
