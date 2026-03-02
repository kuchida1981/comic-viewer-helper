## 1. 準備と基盤整備

- [ ] 1.1 `StoreState` に `isLuckyLoading` を追加し、初期値を `false` に設定する (`src/store.ts`)
- [ ] 1.2 `logic.ts` に現在の候補数を取得、または不足（5件未満）を判定するヘルパー関数を追加する (`src/logic.ts`)
- [ ] 1.3 `DiscoveryManager` の雛形を作成し、`App` クラスで初期化する (`src/managers/DiscoveryManager.ts`, `src/main.ts`)

## 2. DiscoveryManager の実装

- [ ] 2.1 `UIManager` から `_performSearch` と関連する補助メソッドを `DiscoveryManager` に移行する
- [ ] 2.2 `DiscoveryManager` に `jumpToRandomWork()` メソッドを実装する
- [ ] 2.3 `jumpToRandomWork` 内で候補数を確認し、不足時に `nextPageUrl` があれば Deep Fetch を実行するロジックを実装する
- [ ] 2.4 `jumpToRandomWork` 内で候補数を確認し、依然不足している場合にランダムなタグから補充するロジックを実装する
- [ ] 2.5 補充中および補充完了後の `isLuckyLoading` 状態の更新を実装する

## 3. UI と ショートカットの連携

- [ ] 3.1 `UIManager` の `onLucky` ハンドラを `DiscoveryManager.jumpToRandomWork()` の呼び出しに置き換える
- [ ] 3.2 `InputManager` の `randomJump` アクションを `DiscoveryManager.jumpToRandomWork()` の呼び出しに置き換える
- [ ] 3.3 `InputManager` で `isLuckyLoading` が true の場合にショートカット入力をガードする処理を追加する
- [ ] 3.4 `NavigationButtons` コンポーネントで `isLuckyLoading` に応じて 🎲 ボタンを無効化またはローディング表示にするよう修正する

## 4. テストと検証

- [ ] 4.1 `DiscoveryManager` の単体テストを作成し、Deep Fetch とタグ補充が正しく動作することを確認する
- [ ] 4.2 `logic.ts` の新しいヘルパー関数のテストを追加する
- [ ] 4.3 補充中の多重発火防止が機能していることを手動または自動テストで確認する
- [ ] 4.4 全てのプロジェクト標準チェック (`npm run test`, `npm run lint`, `npm run check-types`, `npm run build`) をパスすることを確認する
