## Context

現在、ユーザーデータは各端末の `GM_storage` に独立して保存されています。これを GitHub Gist を介して同期できるようにすることで、マルチデバイスでの一貫した利用体験を提供します。

## Goals / Non-Goals

**Goals:**
- GitHub Gist を使用したデータのバックアップと同期。
- 設定画面からの簡単なセットアップ（PAT, Gist ID）。
- データ更新時の自動アップロード（デバウンス処理付き）。
- スクリプト起動時の自動ダウンロードと適用。
- 競合が発生した場合のシンプルな解決（基本は最新優先）。

**Non-Goals:**
- GitHub 以外のストレージ（Google Drive 等）の今回の実装（将来のための抽象化は考慮する）。
- 詳細な差分（マージ）解決（現時点では JSON 全体の上書き/置換を基本とする）。
- 手動同期ボタンの提供（すべて自動で完結させる）。
- リアルタイム同期（Websocket 等によるプッシュ通知）。

## Decisions

### 1. SyncProvider インターフェースの導入
将来的に Google Drive 等を追加しやすくするため、同期エンジンを抽象化します。
```typescript
interface SyncProvider {
  upload(data: string): Promise<{ gistId: string }>;
  download(gistId: string): Promise<string | null>;
}
```

### 2. GM_xmlhttpRequest の使用
GitHub API への通信には、ブラウザの CORS 制限を回避し、かつ `@connect github.com` 権限を利用できる `GM_xmlhttpRequest` を使用します。

### 3. データのシリアライズとマージ
- 同期データには `lastSyncedAt` タイムスタンプを付与したメタデータを含めます。
- アップロード時: ローカルの全 `GM_storage` データを JSON 化して送信。
- ダウンロード時: 
    - リモートの `lastSyncedAt` がローカルより新しい場合、ローカルデータを更新。
    - `Store` に新しい状態を `setState` し、永続化（`GM_setValue`）を実行。

### 4. デバウンス処理
`Store` は頻繁に更新される可能性があるため（閲覧位置の更新など）、アップロードには 30秒〜1分 程度のデバウンスを設けます。

## Risks / Trade-offs

- **[Risk] GitHub PAT の漏洩** → **[Mitigation]** `GM_setValue` はサイトスクリプトから隔離されているため安全。ユーザーには最小限の権限（gist スコープのみ）を推奨する。
- **[Risk] コンフリクトによるデータ消失** → **[Mitigation]** 更新前に現在のローカルデータを一時的にバックアップするか、Gist の履歴機能を活用する。
- **[Trade-off] 全データ上書き方式** → 複雑なマージロジックを避けるため、今回はシンプルさを優先。
