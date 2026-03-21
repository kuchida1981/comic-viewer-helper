# Proposal: Gist Sync Encryption Option (#258)

## 概要
Gist同期において、データを平文で保存するかAES暗号化して保存するかを選択できる機能を追加する。
これにより、Gist上のデータプライバシーを向上させつつ、既存ユーザーがそのまま利用し続けることも可能にする。

## 背景・目的
- 現在、Gistへの同期データはJSON形式の平文で保存されている。
- 公開/非公開Gistにかかわらず、GitHubのPATが漏洩した場合や、API経由でアクセスされた場合にデータが閲覧されるリスクがある。
- AES暗号化（パスワード保護）を選択肢に加えることで、セキュリティを強化する。

## 変更内容
1.  **SyncConfigの拡張**
    - `encryptionMode`: 'none' | 'aes'
    - `encryptionPassword`: string (Optional)
2.  **暗号化・復号化エンジンの追加**
    - Web Crypto API (AES-GCM) を使用。
    - PBKDF2による鍵導出。
3.  **マイグレーション機能**
    - ダウンロードしたデータが平文か暗号文かをプレフィックスで自動判定。
    - 設定変更時（平文→AES、AES→平文）の自動再暗号化/復号化処理。
4.  **UIの追加**
    - 設定画面に暗号化モードの選択肢とパスワード入力欄を追加。

## 技術仕様
### 保存フォーマット
- 平文: `{ "version": 1, ... }` (JSON)
- 暗号文: `AES-GCM:v1:salt_base64:iv_base64:ciphertext_base64`

### セキュリティ
- ブラウザ標準の `crypto.subtle` を使用。
- パスワードはブラウザのローカルストレージ（GM_setValue）に保存される。

## 影響範囲
- `src/types.ts`: `SyncConfig` インターフェース。
- `src/logic.ts`: 暗号化/復号化ロジック。
- `src/managers/SyncManager.ts`: 同期処理のフロー。
- `src/ui/components/SyncSettings.ts`: UI。

## 懸念事項
- パスワードを忘れた場合のリカバリ（上書きによる同期再開を許容するか）。
- 複数端末で異なるパスワードを設定してしまった場合の競合。
