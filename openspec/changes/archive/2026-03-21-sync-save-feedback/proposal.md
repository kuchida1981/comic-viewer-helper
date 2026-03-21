## Why

現在の同期設定画面では、保存ボタンを押した後に設定が正しく保存されたのか、あるいは通信エラーなどで失敗したのかがユーザーに伝わりません。
ユーザーが設定の有効性を即座に確認できるように、保存実行時のフィードバック（成功・失敗メッセージ）を表示する必要があります。

## What Changes

- 同期設定画面の「保存」ボタン押下時に、設定の保存だけでなく、実際にGistへの接続（データのアップロード）を試行するように変更します。
- 保存処理中の状態（保存中...）をボタンに表示します。
- 保存成功時および失敗時に、適切なフィードバックメッセージと色（成功は緑、失敗は赤）を表示します。
- メッセージ表示後、数秒で通常のステータス表示に戻るようにします。
- 失敗時にはエラーメッセージの具体的な内容を表示し、問題の特定を容易にします。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `reading-position-persistence`: 保存時の即時同期とフィードバックの要件を追加。
- `gm-storage-integration`: 設定保存時のエラーハンドリングと通知の要件を追加。

## Impact

- `src/ui/components/SyncSettings.ts`: UIの実装変更。
- `src/managers/SyncManager.ts`: 即時同期用メソッドの追加。
- `src/managers/UIManager.ts`: 同期処理の呼び出しとUIへの橋渡し。
- `src/i18n.ts`: 保存状態を示す多言語文字列の追加。
- `src/main.ts`: UIManagerへのSyncManagerの注入。
