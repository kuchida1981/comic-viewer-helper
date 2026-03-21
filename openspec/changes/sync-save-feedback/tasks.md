## 1. 準備

- [ ] 1.1 `src/i18n.ts` に `syncSaving`, `syncSaveSuccess`, `syncSaveError` の翻訳文字列を追加する
- [ ] 1.2 `src/managers/SyncManager.ts` に即時アップロード用の `push()` メソッドを実装する
- [ ] 1.3 `src/managers/SyncManager.test.ts` に `push()` メソッドのテストを追加する

## 2. UI コンポーネントの修正

- [ ] 2.1 `src/ui/components/SyncSettings.ts` の `onSave` を非同期関数として受け取るように変更する
- [ ] 2.2 保存ボタン押下時のローディング表示とフィードバック表示を実装する
- [ ] 2.3 `src/ui/components/SyncSettings.test.ts` を非同期 `onSave` に合わせて更新する

## 3. マネージャー層の修正

- [ ] 3.1 `src/managers/UIManager.ts` のコンストラクタで `SyncManager` を受け取るように変更する
- [ ] 3.2 `UIManager` 内の `onSave` コールバックで `syncManager.push()` を呼び出すように実装する
- [ ] 3.3 `src/main.ts` で `UIManager` 初期化時に `SyncManager` を渡すように修正する

## 4. 検証

- [ ] 4.1 `npm run test` を実行し、すべてのテストがパスすることを確認する
- [ ] 4.2 `npm run lint` を実行し、静的解析エラーがないことを確認する
- [ ] 4.3 `npm run check-types` を実行し、型エラーがないことを確認する
- [ ] 4.4 `npx openspec validate --strict --all` を実行し、OpenSpec の整合性を確認する
