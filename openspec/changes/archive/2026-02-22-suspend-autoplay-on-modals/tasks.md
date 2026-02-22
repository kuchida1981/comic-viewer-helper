## 1. コアロジックの修正

- [x] 1.1 `src/managers/Navigator.ts` にモーダル状態（`_lastIsSearchModalOpen`, `_lastIsHelpModalOpen`, `_lastIsMetadataModalOpen`）を保持するプライベートプロパティを追加
- [x] 1.2 `src/managers/Navigator.ts` の `init` メソッド内で、初期状態のモーダル開閉情報を取得
- [x] 1.3 `src/managers/Navigator.ts` の `subscribe` 処理を修正し、いずれかのモーダルが開閉された際にオートプレイタイマーを更新するように変更
- [x] 1.4 `src/managers/Navigator.ts` の `_startAutoplay` メソッドを修正し、モーダルが表示されている場合は実行を保留するようにガード条件を追加
- [x] 1.5 `src/managers/Navigator.ts` の最終ページ到達時の処理から、オートプレイを強制的に `false` にする既存ロジックを削除（仕様変更に伴う調整）

## 2. テストの追加・更新

- [x] 2.1 `src/managers/Navigator.test.ts` に、モーダル表示中にオートプレイが停止することを確認するテストケースを追加
- [x] 2.2 `src/managers/Navigator.test.ts` に、モーダルが閉じられた際にオートプレイが再開することを確認するテストケースを追加

## 3. 検証と仕上げ

- [x] 3.1 `npm run test` を実行し、既存のテストおよび新規追加テストがパスすることを確認
- [x] 3.2 `npm run lint` および `npm run check-types` を実行し、コード品質を確認
- [x] 3.3 `npx openspec validate --strict --all` を実行し、OpenSpecの整合性を確認
