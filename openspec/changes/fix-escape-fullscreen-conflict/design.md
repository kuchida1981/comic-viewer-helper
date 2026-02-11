## Context

フルスクリーン表示中に `Escape` キーを押すと、ブラウザのデフォルト挙動によりフルスクリーンが解除されます。
本アプリでは `Escape` キーをモーダルの閉鎖にも使用していますが、特に入力フィールドにフォーカスがある場合にブラウザがフルスクリーン解除を優先してしまう問題が発生しています。
これまでの `InputManager.onKeyDown` (document capture) での `preventDefault()` 処理だけでは不十分であることが判明しました。

## Goals / Non-Goals

**Goals:**
- モーダルが開いている間は、入力欄にフォーカスがあっても `Escape` キーでモーダルを閉じることを最優先し、フルスクリーンの解除を確実に阻止する。
- 状態管理 (`Store`) と DOM 実態の両面でモーダルの存在を判定し、確実にガードする。

**Non-Goals:**
- フルスクリーン自体の制御ロジックの変更。

## Decisions

### 1. `window` レベルのキャプチャフェーズでのイベント捕捉
`document` よりもさらに上流の `window` レベルにおいて、キャプチャフェーズ (`useCapture: true`) で `keydown` および `keyup` イベントを捕捉します。

- **Rationale**: ブラウザやサイト側のスクリプトがイベントを処理する前に、可能な限り早い段階で介入するため。

### 2. `keyup` イベントの追加捕捉
`keydown` だけでなく `keyup` においても `Escape` キーを判定し、同様に `preventDefault()` と `stopImmediatePropagation()` を実行します。

- **Rationale**: ブラウザによっては `keyup` 時にもフルスクリーン解除のトリガーが仕込まれている場合があるため。

### 3. モーダル存在判定の強化（Store + DOM）
`_isAnyModalOpen` 判定において、`Store` の状態だけでなく、DOM 上にモーダル要素 (`.comic-helper-modal-overlay`) が存在するかを直接チェックします。

- **Rationale**: 状態管理とレンダリングの極小のラグによる判定漏れを防ぎ、確実にガードするため。

### 4. コンポーネントレベルのガードの維持
各モーダルコンポーネント内での `keydown` ガードもバックアップとして維持します。

## Risks / Trade-offs

- **[Risk]** グローバルすぎるイベント捕捉。
  - **Mitigation**: 判定を `Escape` かつ「モーダル表示中」に厳密に絞ることで、通常の操作への影響を最小限にする。
