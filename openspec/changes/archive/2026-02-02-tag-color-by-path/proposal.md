## Why

メタデータモーダルに表示されるタグは、現在すべて同じグレーの背景色で表示されている。タグにはアーティスト、キャラクター、ジャンルなど複数の種類があるが、視覚的に区別できないため、ユーザーが目的のタグを素早く見つけることが困難である。

タグのリンク先URLパス（例: `/artist/`, `/character/`）に応じて色分けすることで、タグの種類を一目で判別できるようにし、UXを向上させる。

## What Changes

- タグデータに `type` プロパティを追加し、URLパスから判定したタグ種別を保持する
- サイトアダプターがタグ種別の判定ロジックを担当する（サイトごとにパス構造が異なる可能性があるため）
- MetadataModal でタグ種別に応じた CSS クラスを付与する
- styles.js にタグ種別ごとの色定義を追加する

## Capabilities

### New Capabilities

- `tag-categorization`: タグをURLパスに基づいて種別分類する機能。アダプターがタグ種別を判定し、UI層で色分け表示する。

### Modified Capabilities

- `metadata-view`: タグ表示において、種別ごとの色分けを行う要件を追加
- `site-adapter`: タグ種別判定のためのメソッド/ロジックを追加

## Impact

- **変更対象ファイル**:
  - `src/adapters/DefaultAdapter.js` - タグ種別判定ロジックの追加
  - `src/ui/components/MetadataModal.js` - 種別に応じたクラス付与
  - `src/ui/styles.js` - 種別ごとの色定義追加
  - `src/store.js` - Metadata 型定義の更新（type プロパティ追加）
- **API変更**: なし
- **破壊的変更**: なし
