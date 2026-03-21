# Tasks: Gist Sync Encryption Option

- [x] `src/types.ts` に `encryptionMode` と `encryptionPassword` を追加。
- [x] `src/i18n.ts` に暗号化関連の翻訳を追加。
- [x] `src/logic.ts` に AES-GCM による `encrypt` / `decrypt` 関数を実装し、テスト (`logic.test.ts`) を追加。
- [x] `src/managers/SyncManager.ts` に暗号化/復号化のフローを組み込む。
- [x] `src/ui/components/SyncSettings.ts` に暗号化設定のUIを追加。
- [x] `npm run test` を実行し、全テストのパスを確認。
- [x] `npm run lint` を実行し、コードスタイルを確認。
- [x] `npm run build` を実行し、ビルドを確認。
