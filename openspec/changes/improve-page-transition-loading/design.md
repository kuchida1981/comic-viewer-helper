## Context

現状の `Navigator.js` は、`jumpToPage` や `scrollToImage` において、`scrollIntoView` を同期的に呼び出すだけである。このため、画像が未ロード（`naturalHeight` が 0 など）の場合、ブラウザが正しいスクロール位置を計算できず、移動に失敗したり、不適切な位置で止まったりする。
また、ユーザーは画像のロードを待っているのか、操作が無視されたのか判断できない。

## Goals / Non-Goals

**Goals:**
- 画像のロード完了を待ってからスクロールすることで、確実に目的のページを表示する。
- ロード待ちの間、ユーザーにフィードバック（ローディング表示）を提供する。
- プリロードにより、ロード待ちの発生頻度自体を減らす。

**Non-Goals:**
- 画像の解像度変更や、サーバー側の配信最適化（クライアントサイドの対策のみ行う）。
- 複雑なキャッシュ管理（ブラウザ標準のキャッシュ機構に依存する）。

## Decisions

### 1. `Navigator` メソッドの非同期化
`jumpToPage` と `scrollToImage` を `async` メソッドに変更し、内部で `await waitForImageLoad(img)` を実行する。
これにより、呼び出し元（`InputManager` や `UIManager`）は待機処理を意識せず、あるいは必要に応じて `await` できるようになる。

### 2. `Store` による `isLoading` 管理
ローディング状態をコンポーネント間で共有するため、`Store` に `isLoading` フラグを追加する。
ただし、これは永続化不要なステートであるため、`Store` の永続化ロジック（`localStorage` 保存）を改修し、特定のキーを除外できるようにする（Allowlist または Blocklist 方式）。
**Decision**: 今回はシンプルに、`localStorage` から復元する際に `isLoading` を常に `false` に初期化するアプローチをとる（保存時は除外せずとも、復元時に無視すれば良いため、実装コストが低い）。もし `Store` の汎用性を高めるなら、保存時に除外キーを指定できるようにする。
→ **Correction**: `Store` クラスを修正し、永続化対象のキーを明示するか、あるいは一時的な状態を管理する仕組みを入れる。既存のコードへの影響を最小限にするため、`Store` のコンストラクタか `setState` のロジックには手を入れず、`localStorage` への保存ロジック（`savePosition` などは別管理だが、`Store` 自体の永続化は `Store.js` 内で行われているか確認が必要）を確認する。
現状の `Store.js` は単純な購読モデルのようなので、永続化ロジックがどこにあるか確認が必要。`main.js` で初期化時にロードしているように見える。

### 3. `waitForImageLoad` の実装
`img.complete` が `true` なら即座に完了。`false` なら `load` イベントを待機する `Promise` を返す。タイムアウト（例: 5秒）を設け、無限待機を防ぐ。

### 4. プリロード戦略
現在のページが表示されたタイミング（`updatePageCounter` や `applyLayout` 後）で、`navigator.preloadImages(currentIndex, count)` を呼び出す。
`HTMLImageElement` の `loading` 属性を操作するのではなく、`new Image().src = ...` でブラウザのキャッシュに乗せる、あるいは単に `img.decode()` を呼ぶ等の方法があるが、既存のDOM要素がすでにあるため、それらの `loading="eager"` への切り替え、または `decode()` の呼び出しを行う。
**Decision**: `img.decode()` を使用する。これは非同期でデコードを行い、完了を待てるが、プリロードとしては単に実行をキックするだけで良い。

## Risks / Trade-offs

**Risk**: プリロードによる通信量の増加
**Mitigation**: プリロード枚数を制限（例: 3枚）し、Wi-Fi環境以外でも過度な負荷にならないようにする（ただしUserScriptなのでネットワーク状態の判定は困難）。ユーザー設定でON/OFFできるようにするのも手だが、まずは固定値で実装する。

**Risk**: タイムアウト時の挙動
**Mitigation**: タイムアウトした場合は、強制的にスクロールを実行する（失敗するかもしれないが、止まるよりは良い）。
