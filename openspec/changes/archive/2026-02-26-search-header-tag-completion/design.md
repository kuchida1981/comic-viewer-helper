## Implementation Plan

### 1. `SearchModal.ts` の `createResultsSection` 修正
ヘッダー生成部分で `searchContext.label` を `<span>` で囲み、クラスを付与してイベントリスナーを設定します。

```typescript
// イメージ
const tagEl = createElement('span', {
  className: 'comic-helper-search-header-tag',
  textContent: searchContext.label,
  events: {
    click: (e) => {
      e.preventDefault();
      onTagCompletion(searchContext.label);
    }
  }
});
```

### 2. `SearchModal.ts` の `createSearchModal` 修正
`onTagCompletion` コールバックを実装し、`input.value` の更新と `input.focus()` を行います。

```typescript
const onTagCompletion = (label: string) => {
  input.value = label + ' ';
  input.focus();
};
```

### 3. `styles.ts` のスタイル追加
`.comic-helper-search-header-tag` に対して以下のスタイルを定義します。
- `cursor: pointer`
- `text-decoration: underline dotted` (またはそれに準ずるホバー効果)
- ホバー時の色変更

## Testing Strategy
- **単体テスト (`SearchModal.test.ts`)**:
  - `searchContext` がある場合にヘッダー内のタグ名が `span` で生成されているか。
  - その `span` をクリックした際、`input.value` が上書きされ、`focus()` が呼ばれるか。
