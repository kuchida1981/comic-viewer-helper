## Context

タグクラウドは `FavoritesModal.ts` の `createTrendSection` が描画し、順位付けと件数制限は `logic.ts` の `calculateTrends` が担う。戻り値は順位順（選択中、ピン留め、件数降順）で、描画は `display: flex; flex-wrap: wrap` により先頭から左上へ並ぶ。

## Goals / Non-Goals

**Goals:**
- 順位の高いタグを中央に、低いタグを外側に配置する。
- 既存の順位付け・件数制限・選択・ピン留めの挙動を変えない。
- 並べ替えは DOM 非依存の純関数にする。

**Non-Goals:**
- 円形・放射状の配置、件数に応じたフォントサイズの変化。
- お気に入り作品グリッドの変更。
- 種類フィルタ（Issue #279 で別途扱う）。

## Decisions

### D1: `calculateTrends` は変更せず、並べ替え専用の純関数を追加する
`arrangeCenterOut<T>(ranked: T[]): T[]` を `logic.ts` に追加する。順位順の配列を受け取り、1位を中央、2位を右、3位を左…と交互に外側へ割り当てた配列を返す。`calculateTrends` の戻り値と件数制限はそのままにするため、順位に基づく挙動は変わらない。#279 の変更とも干渉しない。

### D2: 並べ替えの実装
結果配列を、右側の要素と左側の要素に分けて組み立てる。順位 i（0始まり）のうち、i=0 は中央、奇数は右、偶数（i>0）は左に振り分け、左側を逆順にして「左側 + 中央 + 右側」の順に連結する。5件（A〜E）の場合、左側は C・E を逆順にした E・C、中央は A、右側は B・D となり、E、C、A、B、D になる。偶数件のときは右側が左側より1件多くなる。

### D3: 描画前に適用し、CSS で中央寄せにする
`createTrendSection` で `calculateTrends` の結果に `arrangeCenterOut` を適用してから描画する。`.comic-helper-favorites-trend-tags` に `justify-content: center` を追加する。折り返して複数行になる場合は、行ごとに中央寄せになる（厳密な中心配置にはならない）。

## Risks / Trade-offs

- [折り返し時は行ごとの中央寄せにとどまる] → 横一列の中央寄せという方針であり、許容する。円形配置は Non-Goal。
- [ピン留めした低件数タグが中央に来る] → ピン留めは「目立たせる」機能であり、仕様どおりとする。
