## 1. Implementation

- [x] 1.1 `src/managers/Navigator.ts` の `init` メソッドを修正し、初期化時に `Store` の `isAutoplayEnabled` が `true` であれば `_startAutoplay` を呼び出すようにする。
- [x] 1.2 `src/managers/Navigator.test.ts` に、初期化時のオートプレイ開始動作を検証するテストケースを追加する。

## 2. Verification

- [x] 2.1 ローカル環境でビルドし、ページリロード後もオートプレイが開始されることを確認する。
- [x] 2.2 最終ページからランダムジャンプした後もオートプレイが継続することを確認する。
