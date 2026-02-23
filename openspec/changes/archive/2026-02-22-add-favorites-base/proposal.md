## Why

ユーザーが気に入った作品を保存（お気に入り登録）し、後で簡単に再訪問できるようにするためです。また、ランダムジャンプにユーザーの「好み」を反映させることで、サイト内での回遊性を高め、ユーザー体験を向上させます。

## What Changes

- **データ永続化**: `Store` に `favorites` 状態を追加し、`localStorage` を用いてドメインごとに永続化します。
- **お気に入り登録 UI**: 作品情報モーダル (`MetadataModal`) に現在の作品をお気に入り登録/解除するボタンを追加します。
- **ランダムジャンプの重み付け**: `jumpToRandomWork` ロジックを更新し、お気に入り登録された作品を高い優先度（重み）でランダム抽出の候補に含めます。

## Capabilities

### New Capabilities
- `favorites-management`: お気に入り作品の追加、削除、一覧取得、および永続化。

### Modified Capabilities
- `navigation-control`: ランダムジャンプ (`jumpToRandomWork`) の抽出ロジックに重み付けを導入。

## Impact

- `src/types.ts`: `Favorite` 型の定義。
- `src/store.ts`: `favorites` 状態の追加、永続化ロジックの更新。
- `src/logic.ts`: `jumpToRandomWork` 内での重み付け選択アルゴリズムの実装。
- `src/ui/components/MetadataModal.ts`: 登録・解除ボタンの UI 実装。
- `src/managers/UIManager.ts`: お気に入り状態の変更を UI に反映。
