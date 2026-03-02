## Context

`lucky-navigation-history` の実装に対する gemini-code-assist のレビューで、保守性と一貫性に関する2つの改善点が指摘されました。

1.  `src/logic.ts` に確率を示すマジックナンバー `0.25` が存在し、意図が不明確。
2.  `src/store.ts` の `addLuckyHistory` で、履歴配列内に未正規化のURLが混入する可能性がある。

## Goals / Non-Goals

**Goals:**
- マジックナンバーを名前付き定数に置き換え、可読性を向上させる。
- 履歴配列に保存されるURLを常に正規化された形式に統一する。

## Decisions

### 1. お気に入り抽選確率の定数化
`src/logic.ts` の先頭（または適切な場所）に以下の定数を定義します。
- `const FAVORITE_PICK_CHANCE = 0.25;`
これを `pickRandomWork` 内で使用します。

### 2. `addLuckyHistory` のリファクタリング
履歴の更新時に、既存の配列に対しても `map(normalizeUrl)` を適用し、かつ `Set` を用いて重複を排除します。これにより、保存されるデータの一貫性が保証されます。

```typescript
const normalized = normalizeUrl(url);
const newHistory = Array.from(new Set([
  normalized,
  ...this.state.luckyHistory.map(normalizeUrl)
])).slice(0, MAX_LUCKY_HISTORY);
```

## Risks / Trade-offs

- **[Risk] パフォーマンス** → `map(normalizeUrl)` を毎回実行することによる負荷。
  - **Mitigation**: 履歴は最大20件と非常に小さいため、実行時間は無視できるレベルです。
