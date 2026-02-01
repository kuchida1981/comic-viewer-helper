## Why

`src/main.js` に含まれる UserScript ヘッダが `src/header.js` と重複しており、メタデータの管理場所が分散しています。これにより、バージョンアップや設定変更時に開発者がどちらを編集すべきか混乱を招くリスク（Single Source of Truth の欠如）があります。この変更では、メタデータ管理を `src/header.js` に一元化し、`src/main.js` から不要なヘッダを削除することで、メンテナンス性を向上させます。

## What Changes

- `src/main.js` の先頭にある `// ==UserScript==` から `// ==/UserScript==` までのブロックを削除します。
- `src/header.js` を唯一のメタデータソースとして位置づけます。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- ci-build-verification: ビルド後の成果物における UserScript ヘッダの唯一性と正当性を保証する要件を追加。

## Impact

- **`src/main.js`**: ヘッダブロックが削除され、純粋な JavaScript ロジックのみのファイルになります。
- **`dist/comic-viewer-helper.user.js`**: ビルドプロセス（`npm run build`）の結果、`src/header.js` 由来のヘッダのみが含まれるようになります。
- **開発ワークフロー**: メタデータを変更する際は `src/header.js` を編集し、ロジックを変更する際は `src/main.js` を編集するという役割分担が明確になります。
