## 1. i18n 基礎基盤の実装

- [x] 1.1 `src/i18n.js` を新規作成し、言語判定ロジックと翻訳関数 `t()` を実装する
- [x] 1.2 `en` および `ja` の初期翻訳辞書（UIテキスト、ショートカットラベル/説明）を定義する

## 2. ショートカット定義のリファクタリング

- [x] 2.1 `src/shortcuts.js` のデータ構造を変更し、各ショートカットに `id` プロパティを追加する
- [x] 2.2 `src/shortcuts.js` 内のハードコードされたラベルと説明文を削除し、`t()` を使用して動的に取得するように変更する
- [x] 2.3 `src/main.js` の `onKeyDown` ハンドラを ID ベースの判定ロジックに修正する

## 3. UI コンポーネントの多言語化

- [x] 3.1 `src/ui/components/NavigationButtons.js` のボタンテキストとツールチップを `t()` に置換する
- [x] 3.2 `src/ui/components/SpreadControls.js` のラベルとボタンテキスト、ツールチップを `t()` に置換する
- [x] 3.3 `src/ui/components/MetadataModal.js` のセクションタイトルと閉じるボタンのツールチップを `t()` に置換する
- [x] 3.4 `src/ui/components/HelpModal.js` のタイトルと閉じるボタンのツールチップを `t()` に置換する
- [x] 3.5 `src/ui/components/PowerButton.js` のツールチップを `t()` に置換する
- [x] 3.6 `src/main.js` 内の残りのハードコードテキスト（"Close", "Spread" 等）を `t()` に置換する

## 4. 検証とテスト

- [x] 4.1 言語設定を擬似的に切り替えて、UI テキストが正しく切り替わることを確認する
- [x] 4.2 全ての既存ユニットテストがパスすることを確認する
- [x] 4.3 翻訳辞書のキーの整合性チェック（漏れがないか）を行う
- [x] 4.4 ビルド (`npm run build`) を実行し、UserScript が正しく生成されることを確認する
