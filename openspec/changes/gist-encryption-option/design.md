# Design: Gist Sync Encryption Option

## アーキテクチャ概略
- `src/logic.ts` に暗号化・復号化の純粋なロジックを配置。
- `src/managers/SyncManager.ts` で同期フロー中にこれらのロジックを呼び出す。
- `SyncConfig` に新しいフィールドを追加し、`Store` で管理する。

## データ構造
### SyncConfig (src/types.ts)
```typescript
export interface SyncConfig {
  enabled: boolean;
  pat: string;
  gistId: string;
  lastSyncedAt: number | null;
  encryptionMode: 'none' | 'aes';
  encryptionPassword?: string;
}
```

### 保存フォーマット
暗号化されたデータは以下の形式で保存する。
`AES-GCM:v1:<salt_base64>:<iv_base64>:<ciphertext_base64>`
- `v1`: バージョン識別子。将来のアルゴリズム変更に対応。
- `salt`: PBKDF2用の16バイトのソルト。
- `iv`: AES-GCM用の12バイトの初期化ベクトル。

## 暗号化プロセス (src/logic.ts)
1. パスワードとソルトから PBKDF2 (SHA-256, 100,000回) で鍵を生成。
2. 生成した鍵で AES-GCM 方式によりデータを暗号化。
3. 結果をプレフィックス付き文字列として構築。

## 同期フロー (src/managers/SyncManager.ts)
### ダウンロード (Download & Migration)
1. Gistからデータを取得。
2. プレフィックスをチェック。
   - `AES-GCM:v1:` で始まる場合:
     - 設定が `aes` かつパスワードがあるなら復号を試みる。
     - 復号失敗時（パスワード違い）はエラーを投げ、ユーザーに通知。
   - それ以外（または `{` で始まる）場合:
     - JSONとしてパース。
3. 取得したデータ（平文）をローカルとマージ。

### アップロード (Upload)
1. マージ後のデータを JSON 文字列化。
2. 設定が `aes` なら暗号化。
3. Gistへ保存。

## UI設計 (src/ui/components/SyncSettings.ts)
- `EncryptionMode` を切り替えるセレクトボックス。
- `aes` 選択時のみパスワード入力欄を表示。
- 保存ボタン押下時に `encryptionPassword` をバリデーション（空文字不可）。
