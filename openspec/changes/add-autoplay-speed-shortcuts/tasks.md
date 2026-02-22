## 1. 定義と翻訳の追加

- [ ] 1.1 `src/shortcuts.ts` に `increaseAutoplayInterval` と `decreaseAutoplayInterval` のショートカット ID とキー定義を追加。
- [ ] 1.2 `src/i18n.ts` の `en` および `ja` メッセージに、新しいショートカット用のラベルと説明を追加。

## 2. ロジックの実装

- [ ] 2.1 `src/managers/InputManager.ts` の `_handleShortcutAction` メソッドに、新しいショートカットキーによる `autoplayInterval` の更新ロジックを実装（1〜99秒の範囲制御を含む）。

## 3. テストと検証

- [ ] 3.1 `src/managers/InputManager.test.ts` に、新しいショートカットキーによる `Store` の状態変更を検証するテストケースを追加。
- [ ] 3.2 `npm run test`, `npm run lint`, `npm run check-types` を実行し、既存機能への影響がないことを確認。
- [ ] 3.3 `npx openspec validate --strict --all` を実行し、仕様との不整合がないことを確認。
