## 1. 実装の準備

- [ ] 1.1 既存のテスト（`src/ui/components/components.test.ts`）を実行し、現在の状態を確認する

## 2. コンポーネントの修正

- [ ] 2.1 `src/ui/components/MetadataModal.ts` からバージョン表示ロジックを削除する
- [ ] 2.2 `src/ui/components/HelpModal.ts` にバージョン表示ロジックを追加する

## 3. テストの更新と検証

- [ ] 3.1 `src/ui/components/components.test.ts` の `MetadataModal` テストを更新し、バージョンが表示されないことを確認する
- [ ] 3.2 `src/ui/components/components.test.ts` の `HelpModal` テストを更新し、バージョンが表示されることを確認する
- [ ] 3.3 全てのテスト（`npm run test`）がパスすることを確認する
- [ ] 3.4 リンター（`npm run lint`）と型チェック（`npm run check-types`）を実行する
- [ ] 3.5 ビルド（`npm run build`）が成功することを確認する
- [ ] 3.6 OpenSpec の検証（`npx openspec validate --strict --all`）を実行する
