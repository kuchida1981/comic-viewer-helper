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

## 5. フィードバック対応と修正

- [x] 5.1 `src/i18n.test.js` から未使用の import を削除し、Lint エラーを解消する
- [x] 5.2 `src/i18n.js` の `t()` 関数において、Null 合体演算子 (`??`) を使用してフォールバックを堅牢にする
- [x] 5.3 `src/main.js` の `isKey` ロジックを修正し、`Shift+` を含むショートカットキーを正しく判定できるようにする
- [x] 5.4 `Shift+Space` が正しく動作することを検証する
- [x] 5.5 モーダル表示中にモーダル内のスクロールを許可するように `handleWheel` を修正する
- [x] 5.6 メイン GUI のラベルを英語に戻し、ツールチップのみを多言語対応にする
