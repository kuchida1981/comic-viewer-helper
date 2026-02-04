## 1. クラス実装

- [x] 1.1 `src/managers/PopUnderBlocker.js` を作成し、キャプチャフェーズの click リスナーを登録する
- [x] 1.2 クリック対象が `<a>` タグであることを確認し、それ以外は無視する
- [x] 1.3 `store` の `enabled` フラグが `false` の場合は処理をスキップする
- [x] 1.4 除外条件（`target="_blank"` / Ctrl / Meta / `javascript:`）の判定を実装する
- [x] 1.5 除外対象外の場合は `stopImmediatePropagation()` + `preventDefault()` を呼び、`window.location.href` で直接遷移する

## 2. アプリ統合

- [x] 2.1 `src/main.js` で `PopUnderBlocker` をインポートし、他のマネージャーと同じ粒度で初期化する

## 3. テスト

- [x] 3.1 `src/managers/PopUnderBlocker.test.js` を作成し、各シナリオに対応するテストを書く
- [x] 3.2 通常リンクへのクリックで直接遷移が実行されることを検証する
- [x] 3.3 各除外条件（`target="_blank"` / Ctrl / Meta / `javascript:`）でインターセプトしないことを検証する
- [x] 3.4 `enabled` が `false` の場合でインターセプトしないことを検証する

## 4. 検証

- [x] 4.1 `npm run test` で全テスト緑を確認
- [x] 4.2 `npm run lint` で警告なしを確認
- [x] 4.3 `npm run check-types` で型エラーなしを確認
- [x] 4.4 `openspec validate --strict --all` で妥当性を確認
- [x] 4.5 `IS_UNSTABLE=true npm run build` でビルド成功を確認
