## Why

ブラウザのリサイズ中に、現在表示しているページが勝手に切り替わったり、意図しないページに飛んでしまう（ドリフトする）現象を解決します。これにより、ウィンドウサイズを調整しても読書位置が維持されるようになり、ユーザー体験が向上します。

## What Changes

- `Navigator.applyLayout` において、レイアウト再構築直後の不完全な状態でのページ番号更新を停止します。
- リサイズ開始時の正しいページ番号を維持し、レイアウト確定後の `scrollIntoView` によって正確な位置へ復帰するようにします。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `reading-position-persistence`: リサイズ中も現在の読書位置（ページ番号）が正確に維持されるように要件を明確化します。
- `navigation-control`: レイアウト変更時のスクロール制御が、現在のページ番号を損なわないように挙動を調整します。

## Impact

- `src/managers/Navigator.ts`: `applyLayout` メソッドの修正。
- `src/managers/InputManager.ts`: リサイズハンドリングへの影響確認（基本的には `Navigator` 側の修正で完結予定）。
