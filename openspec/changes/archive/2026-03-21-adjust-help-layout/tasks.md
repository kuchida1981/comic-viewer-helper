## 1. スタイルの調整

- [x] 1.1 `src/ui/styles.ts` で `.comic-helper-shortcut-row:last-child` の `border-bottom` を `none` に設定する
- [x] 1.2 `src/ui/components/SyncSettings.ts` の `titleEl` に `marginTop: '15px'` を追加する

## 2. ヘルプ画面のレイアウト変更

- [x] 2.1 `src/ui/components/HelpModal.ts` で `versionTag` を `extraContent` の後に push するように順序を変更する

## 3. 検証

- [x] 3.1 `npm run test` を実行し、既存のテストが壊れていないことを確認する
- [x] 3.2 `npm run lint` および `npm run check-types` を実行して、コード品質を確認する
- [x] 3.3 手動でヘルプ画面を開き、以下の順序になっていることを確認する：
    - ショートカットリスト
    - 同期設定（境界線とマージンあり）
    - バージョン番号（境界線とマージンあり、最下部）
