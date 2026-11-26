## Context

タグクラウドビューは `FavoritesModal.ts` の `createTagCloudSection` が描画する。`calculateTrends(favorites, TAG_CLOUD_LIMIT, [], [], excludedTypes)` で種類フィルタ後の上位200件を件数降順で取得し、現在は `tag.text.localeCompare` で文字列昇順に並べ替えてから描画している。コンテナ `.comic-helper-tag-cloud` は既に `display: flex; flex-wrap: wrap; justify-content: center` である。

## Goals / Non-Goals

**Goals:**
- 件数の多いタグを中央に、少ないタグを外側に配置する。
- 並べ替えは DOM 非依存の純関数にする（100% カバレッジ）。
- 同じ件数のタグの並びを決定的にする。

**Non-Goals:**
- 円形・放射状の配置。
- 一覧ビューのトレンドセクション、作品グリッドの変更。
- 文字サイズ段階、上位200件、種類フィルタの挙動変更。

## Decisions

### D1: `calculateTrends` は変更せず、配置用の純関数を追加する
`arrangeTagCloud` を `logic.ts` に追加する。`{ tag: { text: string }, count: number }` を持つ要素の配列を受け取り、(1) 件数降順・同数は `tag.text` の `localeCompare` 昇順で順位付けし、(2) 1位を中央、2位を右、3位を左…と交互に外側へ割り当てた配列を返す。入力配列は変更しない。順位付けと配置を1つの関数にまとめ、タイブレークも含めて単体でテストできるようにする。

### D2: 中央から外側への配置アルゴリズム
順位 i（0始まり）について、i=0 は中央、奇数 i は右側、偶数 i（i>0）は左側に振り分ける。左側を逆順（外側が先頭）にして「左側 + 中央 + 右側」の順に連結する。5件（A〜E）の場合、左側は C・E を逆順にした E・C、中央は A、右側は B・D となり、E、C、A、B、D になる。偶数件のときは右側が左側より1件多くなる（4件 A〜D は C、A、B、D）。

### D3: 描画前に適用し、CSS は変更しない
`createTagCloudSection` の `[...trends].sort(localeCompare)` を `arrangeTagCloud(trends)` に置き換える。文字サイズ段階の計算（`min` / `max`）は並び順に依存しないので、そのままにする。CSS は既存の `justify-content: center` を使うため変更しない。

## Risks / Trade-offs

- [折り返して複数行になる場合は、行ごとの中央寄せにとどまる] → 横一列の中央寄せという方針であり許容する。円形配置は Non-Goal。
- [文字列昇順ではなくなるため、特定のタグを探しにくくなる] → タグクラウドは傾向の俯瞰が目的であり、タグの検索は検索モーダルや一覧ビューのトレンドで行える。要望に沿った変更として許容する。
