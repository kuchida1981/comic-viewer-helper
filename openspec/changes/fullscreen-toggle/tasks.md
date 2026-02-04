## 1. i18n の多言語キー追加

- [ ] 1.1 `src/i18n.js` の `en.shortcuts` に `fullscreen: { label: 'Fullscreen', desc: 'Toggle Fullscreen' }` を追加する
- [ ] 1.2 `src/i18n.js` の `ja.shortcuts` に `fullscreen: { label: 'フルスクリーン', desc: 'フルスクリーンの切り替え' }` を追加する

## 2. ショートカット定義の追加

- [ ] 2.1 `src/shortcuts.js` の `SHORTCUTS` 配列に `{ id: 'fullscreen', label: t('shortcuts.fullscreen.label'), keys: ['f'], description: t('shortcuts.fullscreen.desc') }` を追加する

## 3. フルスクリーン実行ロジックの実装

- [ ] 3.1 `src/managers/InputManager.js` の `onKeyDown` メソッド内に `isKey('fullscreen')` の判定を追加する
- [ ] 3.2 判定が真の場合、`document.documentElement.requestFullscreen` の存在を確認し、非存在の場合は静的に無視する
- [ ] 3.3 `document.fullscreenElement` で現在のフルスクリーン状態を判定し、入場・退場をトグルする

## 4. 検証

- [ ] 4.1 `npm run test` で既存テスト全件を緑にする
- [ ] 4.2 `npm run lint` で警告・エラーがないことを確認する
- [ ] 4.3 `npm run check-types` で型エラーがないことを確認する
- [ ] 4.4 `openspec validate --strict --all` で検証を通す
- [ ] 4.5 `IS_UNSTABLE=true npm run build` でビルドを確認する
