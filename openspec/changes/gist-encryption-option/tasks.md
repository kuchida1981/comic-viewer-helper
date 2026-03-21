# Tasks: Gist Sync Encryption Option

- [ ] `src/types.ts` に `encryptionMode` と `encryptionPassword` を追加。
- [ ] `src/i18n.ts` に暗号化関連の翻訳を追加。
- [ ] `src/logic.ts` に AES-GCM による `encrypt` / `decrypt` 関数を実装し、テスト (`logic.test.ts`) を追加。
- [ ] `src/managers/SyncManager.ts` に暗号化/復号化のフローを組み込む。
- [ ] `src/ui/components/SyncSettings.ts` に暗号化設定のUIを追加。
- [ ] `npm run test` を実行し、全テストのパスを確認。
- [ ] `npm run lint` を実行し、コードスタイルを確認。
- [ ] `npm run build` を実行し、ビルドを確認。
