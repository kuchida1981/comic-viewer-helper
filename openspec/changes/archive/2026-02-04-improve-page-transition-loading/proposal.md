## Why

見開き表示時や高速ページ送り時に画像の読み込みが間に合わず、ショートカット移動やジャンプ機能が正常に動作しない（スクロールが途中で止まる）問題が発生しており、読書体験を著しく損ねているため。これを改善し、スムーズで信頼性の高いナビゲーションを実現する必要がある。

## What Changes

- 画像読み込み待ち状態の可視化（ローディングインジケーターの追加）
- ページ遷移ロジックの非同期化（ロード完了待機）
- 先行読み込み（プリロード）の強化による待機時間の削減
- `Store` への `isLoading` 状態の追加とUIへの反映

## Capabilities

### New Capabilities
- `loading-indicator`: ユーザーに処理中であることを明示する視覚的フィードバック機能
- `preload-optimization`: ユーザーの現在位置に基づき、将来アクセスされる可能性が高い画像を先行して読み込む機能

### Modified Capabilities
- `navigation-control`: ページ遷移時に画像のロード状態を確認し、未完了の場合は待機してからスクロールを実行するように要件を変更
- `state-management`: アプリケーション全体でロード状態（`isLoading`）を管理するように要件を変更

## Impact

- `src/managers/Navigator.js`: 遷移ロジックの大幅な変更（非同期化、待機処理）
- `src/managers/UIManager.js`: ローディング表示の制御追加
- `src/store.js`: `isLoading` ステートの追加
- `src/ui/components/`: 新規コンポーネント `LoadingIndicator.js` の追加
