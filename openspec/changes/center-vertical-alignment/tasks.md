## 1. ページ送りロジックの修正

- [ ] 1.1 `src/main.js`: ページ番号入力フォームの更新処理 `updatePageCounter` をインデックスベースのページ判定に対応させる（`getCurrentPageIndex` のロジック確認・調整含む）。
- [ ] 1.2 `src/main.js`: `scrollToImage` 関数を修正し、座標検索ロジックを廃止して、現在のインデックス ±1 の画像をターゲットにするインデックスベースの実装に変更する。
- [ ] 1.3 `src/main.js`: `jumpToPage` 関数を修正し、指定されたページ番号に対応する画像をインデックスで特定してスクロールするように変更する。
- [ ] 1.4 `src/main.js`: `toggleDualView` 関数を修正し、モード切り替え後のスクロール位置調整処理をアライメント変更に合わせて更新する。

## 2. スクロール処理のアライメント変更

- [ ] 2.1 `src/main.js`: `scrollToImage` での `scrollIntoView` 呼び出しオプションを `block: 'start'` から `block: 'center'` に変更する。
- [ ] 2.2 `src/main.js`: `jumpToPage` での `scrollIntoView` 呼び出しオプションを `block: 'start'` から `block: 'center'` に変更する。
- [ ] 2.3 `src/main.js`: `toggleDualView` 内の画像位置調整（`scrollIntoView`）を `block: 'center'` に変更する。
- [ ] 2.4 `src/main.js`: `scrollToEdge` 等、その他のナビゲーション関数のスクロールオプションも `block: 'center'` に統一する。

## 3. 動作確認とテスト

- [ ] 3.1 ユニットテストの更新: `src/logic.js` の変更があれば対応するテストを更新する（今回はロジック変更は限定的だが確認する）。
- [ ] 3.2 動作確認: 単ページ表示で「次へ」「前へ」が正しく中央揃えで移動することを確認する。
- [ ] 3.3 動作確認: 見開き表示で「次へ」「前へ」が正しく中央揃えで移動することを確認する。
- [ ] 3.4 動作確認: ページ番号ジャンプが正しく動作し、中央揃えになることを確認する。
