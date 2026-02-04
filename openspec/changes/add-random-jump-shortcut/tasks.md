## 1. キー決定

- [ ] 1.1 #114 で候補キー（`p`, `l`, `u` など）の議論を経て、最終キーを決定する

## 2. 実装

- [ ] 2.1 `src/i18n.js` に `randomJump` の label・desc キーを追加（`ja` / `en`）
- [ ] 2.2 `src/shortcuts.js` の `SHORTCUTS` 配列に `id: 'randomJump'` エントリを追加し、決定したキーを設定する
- [ ] 2.3 `src/managers/InputManager.js` の `onKeyDown` に `isKey('randomJump')` の判定を追加し、UIManager のランダムジャンプ発火メソッドを呼び出す

## 3. 検証

- [ ] 3.1 指定キー押下でランダムジャンプが正しく動作することを確認する
- [ ] 3.2 HelpModal でショートカットキーがラベルと説明文と共に表示されることを確認する
- [ ] 3.3 `npm run test`, `npm run lint`, `npm run check-types`, `openspec validate --strict --all`, `IS_UNSTABLE=true npm run build` を実行し全て緑を確認する
