# Implementation Tasks

## 1. CSS レイアウトの変更

- [ ] 1.1 `.comic-helper-shortcut-row` のレイアウトを Flexbox から Grid に変更する
  - `display: grid` を設定
  - `grid-template-columns: 180px 140px 1fr` を設定
  - `gap: 12px` を設定
  - `justify-content: space-between` を削除

- [ ] 1.2 `.comic-helper-shortcut-keys` のスタイルを調整する
  - Grid の第1列として機能することを確認
  - 既存の `max-width: 40%` を削除（Grid の列幅で制御されるため不要）

- [ ] 1.3 `.comic-helper-shortcut-label` のスタイルを調整する
  - Grid の第2列として機能することを確認
  - `flex: 1` を削除（Grid の列幅で制御されるため不要）
  - `margin: 0 12px` を削除（Grid の `gap` で制御されるため不要）

- [ ] 1.4 `.comic-helper-shortcut-desc` のスタイルを調整する
  - Grid の第3列として機能することを確認
  - `flex: 1` を削除（Grid の列幅で制御されるため不要）

## 2. 動作確認

- [ ] 2.1 ヘルプモーダルを開いて、すべてのショートカット行が正しく表示されることを確認する
  - キーの個数が異なる行（1個の行と5個の行）で説明文の開始位置が揃っていることを確認
  - テキストの折り返しが適切に動作することを確認
  - モーダルの幅が変わってもレイアウトが崩れないことを確認

- [ ] 2.2 各ショートカット行の視覚的な確認
  - 「次のページ」「前のページ」（キー5個）
  - 「見開き」「見開きオフセット」など（キー1個）
  - すべての行で説明文が縦に揃っていることを確認

## 3. ビルドとテスト

- [ ] 3.1 ビルドが成功することを確認する
  - `IS_UNSTABLE=true npm run build` を実行
  - エラーがないことを確認

- [ ] 3.2 既存のテストが通ることを確認する
  - `npm run test` を実行
  - すべてのテストが通過することを確認
