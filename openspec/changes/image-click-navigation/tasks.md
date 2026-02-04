## 1. ヘルパー関数の追加（logic.js）

- [ ] 1.1 見開き左右方向判定関数 `getClickNavigationDirection(img)` を `logic.js` に追加。引数は画像要素、戻り値は `'next' | 'prev'`。見開きペア（`.comic-row-wrapper` 内に兄弟画像がある場合）の場合は DOM順序と `flexDirection: row-reverse` で左右を判定し、単一画像の場合は常に `'next'` を返す。

## 2. クリック処理の実装（InputManager.js）

- [ ] 2.1 `InputManager` のコンストラクタに `mouseDownPos`（`{x, y} | null`）と `mouseDownTarget`（`HTMLImageElement | null`）のプロパティを追加し、`onMouseDown` と `onMouseUp` をバインドする。
- [ ] 2.2 `init()` に `document.addEventListener('mousedown', this.onMouseDown)` と `document.addEventListener('mouseup', this.onMouseUp)` を追加する。
- [ ] 2.3 `onMouseDown(e)` を実装。`e.target` が `<img>` であれば開始位置と対象要素を記録する。
- [ ] 2.4 `onMouseUp(e)` を実装。記録した対象と一致し移動距離 < 5px の場合に `getClickNavigationDirection` を呼び、戻り値に応じて `navigator.scrollToImage(+1 or -1)` を呼び出す。`enabled` が false やモーダルが開いている場合は早期リターンする。

## 3. ユニットテスト

- [ ] 3.1 `tests/logic.test.js` に `getClickNavigationDirection` のテストを追加。以下のケースをカバーする：
  - 見開きペア中の左側画像クリック → `'next'`
  - 見開きペア中の右側画像クリック → `'prev'`
  - 見開き表示で画像が1枚だけの場合 → `'next'`
  - 見開きモード外の単一画像 → `'next'`

## 4. 検証と commit

- [ ] 4.1 以下のコマンドを全て実行し、全てが緑になることを確認する：
  - `npm run test`
  - `npm run lint`
  - `npm run check-types`
  - `openspec validate --strict --all`
  - `IS_UNSTABLE=true npm run build`
