## Context

タグクラウドビューは `FavoritesModal.ts` の `createTagCloudSection` が描画する。`calculateTrends(favorites, TAG_CLOUD_LIMIT)` で上位200件を集計し、`calculateTagCloudLevel` で文字サイズの段階を決めている。`Tag.type` は `string | null` で、既存の `comic-helper-tag-chip--{type}` でタイプカラーが定義されている。モーダルは開くたびに生成されるため、モーダル内のローカル変数はモーダルを閉じるとリセットされる。

## Goals / Non-Goals

**Goals:**
- タグクラウドビューを種類で除外表示できるようにする。
- ロジックは純関数として `logic.ts` に置く（DOM 非依存、100% カバレッジ）。

**Non-Goals:**
- 一覧ビューのトレンドセクション、お気に入り作品グリッドの絞り込み。
- 除外状態の永続化・同期。
- タグクラウドの配置変更（Issue #280 で別途扱う）。

## Decisions

### D1: `calculateTrends` に除外種類の引数を追加する
末尾に `excludedTypes: ReadonlySet<string | null>`（デフォルトは空）を追加する。集計後、`excludedTypes.has(tag.type)` のタグを、ソート・件数制限の**前**に取り除く。除外されたタグが200件の枠を消費しない。デフォルト引数により、トレンドセクションなど既存の呼び出しは影響を受けない。

### D2: 種類一覧は専用の純関数で求める
`getTagTypes(favorites): Array<string | null>` を `logic.ts` に追加し、お気に入りの全タグに出現する種類を重複なく返す（`null` は最後）。除外状態に関係なく全お気に入りから求めるため、無効にした種類のチップも消えない。

### D3: `null` は「その他」として扱う
内部表現は `null` のまま `Set` に保持し、表示ラベルのみ i18n で「その他」とする。チップのクラスは `type` があればタイプカラーを、`null` なら既定色を使う。

### D4: UI は種類別トグルチップ
`createTagCloudSection` に、除外状態 `excludedTypes` とトグルのコールバックを渡す。タグクラウド本体の上に、種類チップ行を置く。有効なチップはタイプカラー、無効なチップは薄く表示し打ち消し線を付ける。種類が1つ以下のときは、チップ行を表示しない。タグがすべて除外されて 0 件になった場合も、チップ行は表示したまま、タグ領域に「タグがありません」を出す。

### D5: 状態はローカル変数、再描画はタグクラウドのみ
`excludedTypes` は `createFavoritesModal` のローカル状態とし、`Store` へは保存しない。チップのクリックでタグクラウドビューのみを再描画し、一覧ビューは再描画しない。お気に入りの更新（`updateFavorites`）では、除外状態を維持する。

## Risks / Trade-offs

- [除外で文字サイズの基準が変わる] → 段階は表示中のタグの最少・最多件数で決まる。除外後に残ったタグで相対的な大きさを見せる挙動であり、許容する。
- [`type` の値が未知のもの（CSS 未定義）] → チップは既定色で表示される。致命的ではない。
