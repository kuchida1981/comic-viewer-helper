## Why

読者が作品間を移動する際、サイト側のスクリプトが `<a>` クリック時にポップアンダー広告を実行し、読書体験を阻害している。現在のビューアにはこの広告リダイレクトを抑制する仕組みがなく、対策が必要になった。

## What Changes

- 新規クラス `PopUnderBlocker` を `src/managers/` に追加し、`<a>` クリックのポップアンダー抑制を担当する
- `main.js` で `PopUnderBlocker` を初期化・起動する
- 既存のマネージャーの責務や動作には変更しない

## Capabilities

### New Capabilities
- `popunder-blocking`: `<a>` クリック時のポップアンダー広告リダイレクトを抑制する機能。キャプチャフェーズでイベントをインターセプトし、サイト側スクリプトの実行を防止し、現在のタブで直接遷移を実行する。

### Modified Capabilities
<!-- なし -->

## Impact

- **新規ファイル**: `src/managers/PopUnderBlocker.js`、`src/managers/PopUnderBlocker.test.js`
- **変更ファイル**: `src/main.js`（`PopUnderBlocker` の初期化を追加）
- 既存のマネージャーやスペックへの影響はない