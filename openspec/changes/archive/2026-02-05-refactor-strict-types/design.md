## Context

イシュー #117に基づき、初期の TypeScript 移行で残存した `any` キャスト や `@ts-expect-error` を削減する。
対象は3つのファイルに絞られ、いずれも型の精度改善に限定される。動作・APIの変更なし。

## Goals / Non-Goals

**Goals:**
- `src/store.ts` の `@ts-expect-error` を削除し、動的キーアクセスを型安全にする
- `src/i18n.ts` の `any` キャスト（2箇所）と eslint-disable コメントを削除し、再帰キーアクセスを型安全にする
- `src/managers/UIManager.ts` の重複インターフェース定義を削除し、コンポーネント実装側の型をそのまま再利用する

**Non-Goals:**
- `src/ui/utils.ts` の変更（既に型安全）
- 動作やAPIの変更
- 既存テストの変更（型改善のみなのでコンパイル・テスト通過を確認すれば十分）

## Decisions

### 1. store.ts — ヘルパー関数による型安全な動的代入

**問題**: `Partial<StoreState>` の各キーを `for...in` で走査し代入する際、`patch[k]` の型が `StoreState[keyof StoreState] | undefined` となり、直接代入できない。

**決定**: 汎用ヘルパー関数を導入し、キーと値の対応を関数スコープで束縛する。

```typescript
function applyPatch<K extends keyof StoreState>(
  state: StoreState,
  key: K,
  value: StoreState[K]
): void {
  state[key] = value;
}
```

`for...in` ループ内で `Object.keys(patch)` に置換し、各キーについて `applyPatch` を呼び出す。これにより TypeScript が `key` と `value` の型の一致を静的に検証できる。

**検討した代替案**:
- `as` キャスト: `@ts-expect-error` と同様に型チェックを迂回するため、本質的に改善しない
- `Object.assign`: 変更されたキーを検出（差分チェック）できないため、既存の通知ロジックに適さない

### 2. i18n.ts — `unknown` 型とナローイングによる any 削除

**問題**: `MESSAGES[lang]` はネストされた辞書であり、動的なドット記法キーで再帰的にアクセスされる。各アクセス段階で型を追跡しきれないため `any` が使われている。

**決定**: `result` と `fallback` の型を `unknown` にする。各ループ反復で `typeof result === 'object' && result !== null` で絞り込み、インデックスアクセスは `Record<string, unknown>` へのキャストで行う。最終値の `typeof` チェックで `string` を安全に返す。

```typescript
let result: unknown = MESSAGES[currentLang];
let fallback: unknown = MESSAGES['en'];
for (const key of keys) {
  result = (typeof result === 'object' && result !== null)
    ? (result as Record<string, unknown>)[key]
    : undefined;
  fallback = (typeof fallback === 'object' && fallback !== null)
    ? (fallback as Record<string, unknown>)[key]
    : undefined;
}
```

`any` → `unknown` へ変更し、アクセス箇所で絞り込むことで eslint-disable コメントも不要になる。

**検討した代替案**:
- 再帰ジェネリック型による完全な静的追跡: `MessageKey` の型が既に正確なため、実行時には動的キーアクセスが必然。静的に完全に追跡するためには大規模な型ユーティリティが必要で、メンテナビリティが低下する

### 3. UIManager.ts — 重複インターフェースの削除と再エクスポート利用

**問題**: `PowerButtonComponent` インターフェースが `UIManager.ts`（行18-21）と `PowerButton.ts`（行9-12）で同時に定義されている。内容は同一だが、UIManager側の定義が単独で維持される必要がない。

**決定**: `UIManager.ts` のローカル `PowerButtonComponent` インターフェース定義を削除し、`PowerButton.ts` からインポートする。
他のコンポーネントインターフェース（`PageCounterComponent` など）についても同様に実装側で定義されているか確認し、重複があればインポートに統一する。

**検討した代替案**:
- インターフェース名を異なる名前にする: 混乱を増やすため不適

## Risks / Trade-offs

- [リスク] `unknown` 型へのナローイングが不十分な場合、実行時エラーに → ミティゲーション: 既存の `typeof value === 'object'` の最終チェックが安全网として残る。既存テストで検証する。
- [リスク] コンポーネント実装側のインターフェース変更が今後あった場合にUIManagerも変動する → ミティゲーション: これは正しい動為であり、重複維持による変更漏れを防ぐのがこの変更の目的。