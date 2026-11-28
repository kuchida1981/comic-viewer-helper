# Proposal

## Why

グラフビューは表示ノード数を50件に固定している。お気に入りの量や画面の大きさ、見たい細かさに合わせて、ユーザーが数を調整できるようにする（#294、#292 の後続）。

## What Changes

- グラフビューに、表示ノード数のスライダー（10〜100、10刻み、初期値50）を追加し、現在の値を表示する
- スライダーを動かしている最中にグラフへ反映する
- 選んだ値は端末に保存し、次に開いたときも使う（Gist 同期の対象外）
- 残るノードは今の位置から動かし、増えるノードはつながる相手の近くに出す
- 50件を超えてもグラフが表示領域に収まるよう、力の強さをノード数に合わせて調整する

対象外: 線の間引き条件（共起2件、上位3本）の調整、#295 のレビューで任意とされた軽微な点。

## Capabilities

### New Capabilities

なし

### Modified Capabilities
- `favorites-tag-graph`: ノード数の固定上限を、ユーザーが調整できる上限に変える

## Impact

- `src/logic.ts`: 値の正規化、増えるノードの初期位置、ノード数に応じた反発の調整
- `src/store.ts`: 値の読み込みと保存
- `src/ui/components/TagGraphView.ts`、`FavoritesModal.ts`、`src/managers/UIManager.ts`: スライダーと値の受け渡し
- `src/types.ts`、`src/ui/styles.ts`、`src/i18n.ts`: 型、スタイル、文言
- 実行時依存の追加はなし
