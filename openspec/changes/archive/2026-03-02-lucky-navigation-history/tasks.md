## 1. 基礎データ構造と状態管理の追加

- [x] 1.1 `src/store.ts` に `STORAGE_KEYS.LUCKY_HISTORY` を追加
- [x] 1.2 `src/types.ts` または `src/store.ts` の `StoreState` に `luckyHistory: string[]` を追加
- [x] 1.3 `Store` クラスに `luckyHistory` の初期化、読み込み、永続化ロジックを追加

## 2. URL正規化と純粋な抽選関数の実装

- [x] 2.1 `src/logic.ts` に `normalizeUrl(url: string): string` 関数を実装
- [x] 2.2 `src/logic.ts` に `pickRandomWork` 関数を実装（履歴除外とフォールバックロジックを含む純粋関数）
- [x] 2.3 `pickRandomWork` および `normalizeUrl` のユニットテストを作成 (`src/logic.test.ts`)

## 3. 履歴更新と遷移実行の統合

- [x] 3.1 `src/main.ts` または適切な初期化場所で、ページ読み込み時に現在のURLを `luckyHistory` に追加する処理を実装
- [x] 3.2 `src/managers/UIManager.ts` および `src/managers/InputManager.ts` の既存の `jumpToRandomWork` をリファクタリングし、`pickRandomWork` を使用するように変更
- [x] 3.3 `src/managers/Navigator.ts` でオートプレイ終了時にランダムジャンプする箇所を新ロジックに対応


## 4. 最終確認と品質チェック

- [x] 4.1 全てのテストがパスすることを確認 (`npm run test`)
- [x] 4.2 型チェックとリンターを実行 (`npm run check-types`, `npm run lint`)
- [x] 4.3 ビルドが成功することを確認 (`npm run build`)
- [x] 4.4 OpenSpec の検証を実行 (`npx openspec validate --strict --all`)
