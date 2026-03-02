## Why

gemini-code-assist によるコードレビューの結果、マジックナンバーの使用や履歴保存時の正規化の不備など、保守性と仕様への準拠に関する改善点が指摘されました。これらを修正し、コードの品質と一貫性を高めます。

## What Changes

- **マジックナンバーの定数化**: `src/logic.ts` 内のお気に入り抽選確率 `0.25` を、意味のある定数（`FAVORITE_PICK_CHANCE`）に置き換えます。
- **履歴URLの完全な正規化**: `src/store.ts` の `addLuckyHistory` メソッドを修正し、履歴配列に保存される全てのURLが常に正規化された状態になるようにします。

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
- `lucky-history`: 履歴として保存されるデータが常に正規化されていることを保証するように要件を明確化します。

## Impact

- `src/logic.ts`: 定数の導入と適用。
- `src/store.ts`: `addLuckyHistory` ロジックの修正。
