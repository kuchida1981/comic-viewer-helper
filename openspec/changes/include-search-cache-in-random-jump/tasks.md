## 1. Logic Implementation

- [ ] 1.1 `src/types.ts` で `jumpToRandomWork` のシグネチャ変更に備え、必要なら型定義を調整する（今回は関数シグネチャ変更のみなので不要かもしれないが確認）。
- [ ] 1.2 `src/logic.ts` の `jumpToRandomWork` 関数を更新し、第2引数に `searchCache?: SearchCache` を受け取るように変更する。
- [ ] 1.3 `jumpToRandomWork` 内で `metadata.relatedWorks` と `searchCache.results.results` をマージし、`href` で重複排除するロジックを実装する。
- [ ] 1.4 `src/logic.test.ts` にテストケースを追加し、検索キャッシュがある場合とない場合の挙動を検証する。

## 2. Integration

- [ ] 2.1 `src/managers/UIManager.ts` の `onLucky` ハンドラを更新し、`store.state.searchCache` を `jumpToRandomWork` に渡すように変更する。
- [ ] 2.2 `src/managers/InputManager.ts` のショートカット処理を更新し、同様に `store.state.searchCache` を渡すように変更する。

## 3. Verification

- [ ] 3.1 アプリケーションをビルドし、エラーがないことを確認する。
- [ ] 3.2 ブラウザで動作確認を行い、検索後にランダムジャンプを実行して検索結果が含まれるか（確率的だが）確認する。
