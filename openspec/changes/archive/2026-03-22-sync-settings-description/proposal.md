## Why

同期設定（GitHub Gist連携）において、入力項目（Personal Access Token, Gist IDなど）の意味や取得方法、および暗号化設定の変更・解除手順が初見のユーザーにとって不透明であり、設定を完了したり安全に変更したりすることが困難な状況を解消するため。

## What Changes

- 同期設定画面の冒頭に、機能の概要を説明する導入テキストを追加。
- 各入力項目（GitHub PAT、Gist ID、暗号化モード、パスワード）に対して、役割や取得方法、操作上の注意点（パスワード変更や解除の手順など）を説明する補足テキストを追加。
- UIコンポーネント `SyncSettings` を拡張し、これらの説明テキストを表示できるように変更。
- 多言語対応（日本語・英語）のための翻訳テキストを `i18n.ts` に追加。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `sync-data-via-gist`: ユーザーが設定項目を理解し、安全に設定・変更（パスワード変更や暗号化解除を含む）を行えるよう、UIに適切なガイド（説明文）を提供しなければならない。

## Impact

- `src/ui/components/SyncSettings.ts`: UI構造の変更と説明テキストの挿入。
- `src/i18n.ts`: 新しい説明用メッセージキーの追加。
- `src/ui/styles.ts`: 説明テキスト用のスタイルの追加（必要に応じて）。
