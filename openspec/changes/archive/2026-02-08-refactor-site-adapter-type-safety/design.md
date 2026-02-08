## Context

現在の `SiteAdapter` インターフェースは、`match`, `getContainer`, `getImages` を除く多くのメソッドが optional (`?`) として定義されています。
これらを呼び出す際、`UIManager` や `main.ts` では以下の問題が発生しています：
1. `if (!this.adapter.getSearchUrl) return;` のような実行時チェックが各所に分散している。
2. 実行時チェックを行っているにもかかわらず、TypeScript の制御フロー解析が十分に機能せず、呼び出し時に `!` (non-null assertion) が必要になっている。
3. アダプターがどの「機能セット」をサポートしているかが型レベルで明示的ではない。

## Goals / Non-Goals

**Goals:**
- Type Guard (User-Defined Type Guards) を導入し、機能の有無を安全かつ簡潔に判定できるようにする。
- 呼び出し側での `!` アサーションを排除する。
- アダプターの機能を論理的なサブインターフェース（`SearchableAdapter`, `MetadataAdapter`）に分離する。

**Non-Goals:**
- `SiteAdapter` インターフェース自体の破壊的な変更（既存のアダプター実装を壊さない）。
- 検索ロジックやメタデータ抽出ロジック自体の変更。

## Decisions

### 1. サブインターフェースの導入
`src/types.ts` に以下のサブインターフェースを追加します。

- `SearchableAdapter`: `getSearchUrl` と `parseSearchResults` を必須項目として持つ。
- `MetadataAdapter`: `getMetadata` を必須項目として持つ。

**Rationale:**
単一の巨大なインターフェースにすべてのメソッドを詰め込むのではなく、機能ごとにインターフェースを定義することで、どのコンポーネントがどのアダプター機能を必要としているかを型で表現できるようになります。

### 2. Type Guard 関数の実装
以下の判定関数を `src/types.ts` に追加します。

```typescript
export function isSearchableAdapter(adapter: SiteAdapter): adapter is SearchableAdapter {
  return typeof adapter.getSearchUrl === 'function' && typeof adapter.parseSearchResults === 'function';
}

export function isMetadataAdapter(adapter: SiteAdapter): adapter is MetadataAdapter {
  return typeof adapter.getMetadata === 'function';
}
```

**Rationale:**
TypeScript の `is` キーワード（Type Predicates）を使用することで、`if (isSearchableAdapter(this.adapter))` というチェックを通った後は、そのブロック内で `this.adapter` を `SearchableAdapter` 型として安全に扱えるようになります。

### 3. 呼び出し側のリファクタリング
- `src/managers/UIManager.ts` の `_performSearch` メソッドで `isSearchableAdapter` を使用。
- `src/main.ts` の `init` メソッドで `isMetadataAdapter` を使用。

## Risks / Trade-offs

- **[Risk] 新しいメソッド追加時の Type Guard 更新忘れ**
  - **Mitigation**: 機能セットが増える場合は必ず対応する Type Guard を作成するルールを徹底する。
- **[Trade-off] 実行時のオーバーヘッド**
  - **Impact**: 極めて微小。単なる `typeof === 'function'` チェックであるため、パフォーマンスへの影響は無視できる。
