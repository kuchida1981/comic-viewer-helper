## Why

「I'm feeling lucky」（🎲ボタン）のランダム遷移で、非公開作品へのジャンプが発生しており、遷移先がエラーやブランクページとなるため UX が低下している。非公開作品の判定はサイト固有のルールであるため、アダプター層で吸収し、遷移対象から除外する。

## What Changes

- `relatedWorks` の各要素に `isPrivate` フラグを付与する（アダプター層で判定・設定）
- ランダム遷移のハンドラで `isPrivate` な作品を除外してから抽選する
- Info モーダルでの表示は変更しない（非公開作品も引き続き表示）

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
- `site-adapter`: アダプターのメタデータ抽出で、タイトルの先頭が「非公開」の関連作品に `isPrivate: true` を付与する要件を追加
- `lucky-navigation`: ランダム遷移の抽選対象から `isPrivate` な作品を除外する要件を追加

## Impact

- `src/global.d.ts`: `relatedWorks` の型定義に `isPrivate?: boolean` を追加
- `src/store.js`: JSDoc の `Metadata` typedef に同様の追加
- `src/adapters/DefaultAdapter.js`: `relatedWorks` 構築時に `isPrivate` フラグを付与
- `src/managers/UIManager.js`: `onLucky` ハンドラで非公開作品をフィルタリング
