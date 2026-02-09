## Why

現在のコードベースにおいて、主要なコンポーネント（特に `UIManager` や `logic.ts`）の循環的複雑度（Cyclomatic Complexity）が高くなっており（最大40）、テストカバレッジの向上やメンテナンスの妨げとなっている。これを解決するために、静的解析による複雑度の制限を導入し、既存コードをリファクタリングする。

## What Changes

- ESLint設定に `complexity` ルール（閾値: 10）を追加
- `UIManager.updateUI` の巨大なメソッドを、責務（コンポーネント更新、モーダル管理、レイアウト）ごとに分割
- `InputManager.onKeyDown` を、if-elseチェーンからコマンドパターン（マップ検索）へ変更
- `logic.ts` の `fitImagesToViewport` から、ペアリング判定やDOM操作ロジックを独立した純粋関数へ切り出し
- `ui/utils.ts` の `createElement` を、属性適用やスタイル適用ごとのヘルパー関数に分割
- これらにより、各関数の複雑度を10以下（またはそれに準ずる水準）に抑える

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `linting`: 循環的複雑度の制限（閾値10）を追加
- `ui-architecture`: コンポーネント更新ロジックの分離と自律化に関する要件を追加

## Impact

- **Codebase**: `src/managers/`, `src/logic.ts`, `src/ui/utils.ts` が大きく変更される
- **Tests**: リファクタリングに伴い、ユニットテストの構造も見直しが必要になる可能性がある（より小さな単位でのテストが可能になる）
- **Build**: ESLint実行時に複雑度エラーが検出されるようになる（既存コードは一時的に対応が必要だが、本変更で修正する）
