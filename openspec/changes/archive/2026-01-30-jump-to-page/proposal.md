## Why

ユーザーが多数の画像を含む作品を閲覧する際、特定のページ（画像）に素早くジャンプする手段がありません。ページ番号を入力して直接ジャンプできる機能を提供することで、閲覧の利便性を向上させます。

## What Changes

- ナビゲーションUIにページ番号入力用のフォーム（input）を追加します。
- 数値を入力してEnterキーを押すことで、該当するページへ即座にスクロールする機能を実装します。
- 入力値のバリデーション（範囲外の数値の抑制など）を導入します。

## Capabilities

### New Capabilities
- `page-jump`: ページ番号入力による特定ページへのジャンプ機能を提供します。

### Modified Capabilities
- `navigation-control`: 既存のナビゲーションUIに入力フォームを統合します。

## Impact

- `src/main.js`: UIの生成ロジックおよびイベントハンドリングの追加。
- `src/logic.js`: 特定のインデックスへのスクロール計算ロジックの追加。
- `openspec/specs/navigation-control/spec.md`: UI構成の変更に伴う仕様更新。
