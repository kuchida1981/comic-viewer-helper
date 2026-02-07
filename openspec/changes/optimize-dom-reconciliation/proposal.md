## Why

現在の `fitImagesToViewport` 関数は、呼び出されるたびにコンテナ内のすべてのラッパー要素を破棄し、再生成しています。これにより、見開き表示の切り替えやウィンドウリサイズ時に大量のDOMノードの破棄と生成が発生し、メモリ使用量の増加とレンダリングパフォーマンスの低下を招いています。DOMの再利用（Reconciliation）を導入することで、これらのオーバーヘッドを最小限に抑え、スムーズな操作感を実現します。

## What Changes

- **DOM更新ロジックの変更**: 全削除・全再生成方式から、既存のDOM構造と比較し差分のみを更新する方式（Reconciliation）へ変更します。
- **ラッパー要素の永続化**: 画像を囲む `.comic-row-wrapper` を可能な限り維持し、属性やスタイルの更新のみで対応します。
- **クリーンアップ処理の最適化**: `cleanupDOM` を、無条件な全削除ではなく、正規化が必要な場合や完全なリセットが必要な場合のみに使用するように変更、あるいはReconciliationプロセスの一部として統合します。

## Capabilities

### Modified Capabilities
- `ui-architecture`: DOM生成・更新戦略における、不要な再生成を避ける「Reconciliation」パターンの採用。
- `dual-page-view`: 見開き表示時のペアリングロジック実行において、既存のDOM構造を維持しながらペアリング状態を更新する要件。

## Impact

- `src/logic.ts`: `fitImagesToViewport`, `cleanupDOM` の大幅な書き換え。
- `src/managers/Navigator.ts`: 呼び出し元の変更は軽微（あるいはなし）だが、パフォーマンス特性が変わる。
