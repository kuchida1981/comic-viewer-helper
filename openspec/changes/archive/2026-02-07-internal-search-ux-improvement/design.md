# Design: 検索コンテキストと入力状態の分離

## 状態管理の方針

### Store
- `searchQuery`: ユーザーが入力フォームから直接入力した最新の文字列のみを保持する。
- `searchContext`: 現在の検索条件（keyword 検索か、それとも特定のタグ検索か）を保持する。

### 検索実行フロー (`UIManager._performSearch`)

```typescript
async _performSearch(queryOrUrl, silent, context) {
  // 1. チラつき防止: 検索開始と同時に表示をクリア
  if (!silent) {
    this.store.setState({ searchResults: null });
  }

  // ... (URL判定ロジック)

  if (context) {
    // 【タグ検索時】
    // searchContext のみを更新し、searchQuery は以前の値を維持する
    this.store.setState({ searchContext: context });
  } else if (!isUrl) {
    // 【キーワード検索時】
    // searchQuery と searchContext(keyword) の両方を更新する
    this.store.setState({ 
      searchQuery: query,
      searchContext: { type: 'keyword', label: query }
    });
  }
}
```

## UI コンポーネントの変更

### `SearchModal`
入力欄 (`input.value`) の初期値を決定する際、以下の優先順位で制御する。

1. `searchContext.type === 'keyword'` の場合: `searchQuery` を表示する。
2. それ以外（タグ検索時）の場合: 空文字列 `""` を表示する。

### シナリオ例
1. ユーザーが「マフラー」と入力して検索。 -> `searchQuery`="マフラー", `input`="マフラー"
2. ユーザーが作品情報の「アクション」タグをクリック。 -> `searchQuery`="マフラー" (維持), `searchContext`=Genre:アクション, `input`="" (クリア)
3. ユーザーが検索モーダルを閉じ、再び開く。 -> `searchContext` は「アクション」なので `input` は空のまま。
4. ユーザーが `input` に「手袋」と入力して検索。 -> `searchQuery`="手袋", `searchContext`=Keyword:手袋, `input`="手袋"
