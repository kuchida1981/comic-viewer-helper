## Context

タグクラウドは `FavoritesModal.ts` の `createTrendSection` が描画し、集計・並び順は `logic.ts` の純関数 `calculateTrends(favorites, limit, pinnedTags, selectedTags)` が担う。`Tag.type` は `string | null` で、既存の `comic-helper-tag-chip--{type}` でタイプカラーが定義されている。選択タグ・「すべて表示」の状態は `createFavoritesModal` 内のローカル変数で管理され、モーダルを閉じるとリセットされる。

## Goals / Non-Goals

**Goals:**
- タグクラウドを種類で除外表示できるようにする。
- 既存の選択・ピン留め・件数制限の挙動を壊さない。
- ロジックは純関数として `logic.ts` に置く（DOM 非依存、100% カバレッジ）。

**Non-Goals:**
- お気に入り作品グリッドの絞り込み（種類フィルタは作用しない）。
- 除外状態の永続化・同期。
- タグクラウドの配置変更（Issue #280 で別途扱う）。

## Decisions

### D1: `calculateTrends` に除外種類の引数を追加する
末尾に `excludedTypes: ReadonlySet<string | null>`（デフォルト空）を追加する。集計後、`selectedSet` に含まれないタグのうち `excludedTypes.has(tag.type)` のものを、ソート・件数制限の**前**に取り除く。これにより、除外されたタグが件数枠を消費しない。選択中タグは除外判定の対象外とし、常に残す。デフォルト引数により既存の呼び出しは影響を受けない。

### D2: 種類一覧は専用の純関数で求める
`getTagTypes(favorites): Array<string | null>` を `logic.ts` に追加し、お気に入りの全タグから出現する種類を重複なく返す（既知種類の定義順、`null` は最後）。除外状態に関係なく全お気に入りから求めるため、無効にした種類のチップも消えない。

### D3: `null` は「その他」として扱う
内部表現は `null` のまま `Set` に保持し、表示ラベルのみ i18n で「その他」とする。種類チップのクラスは `type` があればタイプカラーを、`null` なら無色（既定色）を使う。

### D4: UI は種類別トグルチップ
ラベル行（「お気に入りトレンド」と「すべて表示」ボタンの行）の下に、種類チップの行を置く。有効なチップはタイプカラー、無効なチップは薄く表示し打ち消し線を付ける。クリックで `excludedTypes` を更新し、トレンドセクションのみ再描画する（作品グリッドは再描画しない）。種類が1つ以下のときは、フィルタの意味がないため種類チップ行を表示しない。

### D5: 状態はローカル変数
`excludedTypes` は `selectedTagTexts` と同様に `createFavoritesModal` のローカル状態とし、モーダルを閉じるときにリセットする。`Store` へは保存しない。

## Risks / Trade-offs

- [全種類を無効にするとタグクラウドが空になる] → 空のときはセクションごと非表示にする現在の挙動だと種類チップも消え復帰できなくなるため、種類チップ行は `trends` が空でも、お気に入りに2種類以上のタグがあれば表示を維持する。
- [`type` の値が未知のもの（CSS 未定義）] → チップは既定色で表示される。致命的ではない。
