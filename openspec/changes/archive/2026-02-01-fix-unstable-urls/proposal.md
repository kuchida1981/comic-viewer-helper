## Why

現在、Unstable 版（開発版）のビルド成果物に含まれる `@updateURL` と `@downloadURL` が Stable 版（安定版）の URL を指しています。これにより、Unstable 版を使用しているユーザーの自動更新が正しく機能せず、最新の開発版への追従が妨げられる問題があります。

## What Changes

- `scripts/build.mjs` を修正し、`unstable` ビルド時にはヘッダ内の URL を `unstable` ブランチに向くように書き換えます。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- **ci-deployment**: Unstable 版デプロイ時のメタデータ（URL）の整合性要件を明確化します。

## Impact

- **ビルドプロセス**: `npm run build` の挙動が変更され、`IS_UNSTABLE=true` 時には URL の書き換えが行われるようになります。
- **ユーザー体験**: Unstable 版ユーザーの自動更新が正常に機能するようになります。
