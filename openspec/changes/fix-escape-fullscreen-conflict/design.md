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

### 2. イベントサイクル管理フラグ (`_escapeCycleHandled`) の導入
`keydown` で `Escape` を処理した際にフラグを保持し、対になる `keyup` イベントも確実に捕捉・抑制します。

### 3. フォーカス強制解除と移動 (`blur` & `focus`)
`Escape` 処理の瞬間に `document.activeElement` が `input` 等であった場合、即座に `blur()` を実行し、さらに `document.body.focus()` を呼び出します。ブラウザの「入力欄からの脱出」という判断基準を物理的に取り除く試みです。

### 4. 非同期クローズ (`setTimeout`)
モーダルの閉鎖処理 (`setState`) を `setTimeout(..., 0)` で非同期化します。`preventDefault()` と `stopImmediatePropagation()` を呼んだ直後のメインループでブラウザに「イベント処理完了」を認識させ、その後に DOM を更新することで、フルスクリーン解除挙動との競合を回避します。

## Risks / Trade-offs

- **[Risk]** グローバルすぎるイベント捕捉。
  - **Mitigation**: 判定を `Escape` かつ「モーダル表示中」に厳密に絞ることで、通常の操作への影響を最小限にする。
