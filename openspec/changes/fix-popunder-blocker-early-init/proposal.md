## Why

現在、`PopUnderBlocker` はビューアーが正常に起動する条件（`#post-comic` 要素が存在する場合）でのみ初期化されています。
そのため、ビューアーが起動する前の「作品詳細（info）ページ」や「検索結果ページ」において、サイト側のスクリプトによるポップアンダー広告（リンククリック時に新しいタブで開く、あるいはポップアップが開く挙動）が発生してしまいます。

## What Changes

- `src/main.ts` の `App.init()` メソッドにおいて、`this.adapter.getContainer()` による早期リターンの前に `this.popUnderBlocker.init()` を実行するように変更します。
- これにより、ビューアーが起動しないページ（作品詳細ページ、検索結果ページ等）においても、`PopUnderBlocker` が有効であれば `<a>` タグのクリックイベントをインターセプトし、現在のタブで直接遷移するようにします。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `popunder-blocking`: ビューアーの起動状態に関わらず、サイト内の全ページで広告抑制を有効にするように仕様を拡張します。

## Impact

- `src/main.ts`: 初期化フローの変更。
- `src/managers/PopUnderBlocker.ts`: 実装に変更はないが、動作環境が拡大する。
- ユーザー体験: サイト内の遷移がよりスムーズになり、意図しないポップアップが減少する。
