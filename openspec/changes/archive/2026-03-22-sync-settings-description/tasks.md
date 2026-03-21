## 1. 翻訳テキストの追加

- [x] 1.1 `src/i18n.ts` に `en.ui` セクションの説明用メッセージキーを追加
- [x] 1.2 `src/i18n.ts` に `ja.ui` セクションの説明用メッセージキーを追加

## 2. スタイルの定義

- [x] 2.1 `src/ui/styles.ts` に説明テキスト用のCSSクラス `.comic-helper-sync-description` を追加

## 3. UIコンポーネントの修正

- [x] 3.1 `src/ui/components/SyncSettings.ts` に導入テキストを追加
- [x] 3.2 `src/ui/components/SyncSettings.ts` の各入力項目に説明テキストの要素を追加

## 4. 動作確認と検証

- [x] 4.1 既存の `src/ui/components/SyncSettings.test.ts` がパスすることを確認
- [x] 4.2 必要に応じてテストコードを更新し、新しい要素がレンダリングされていることを検証
- [x] 4.3 プロジェクト全体のチェック（lint, check-types, test, build, openspec validate）を実行
