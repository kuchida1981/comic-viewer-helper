## Why
オートプレイ機能が有効な際、検索、ヘルプ、または作品情報（Info）のモーダルが表示されている間でも背景でページが自動的に進んでしまうため、ユーザーの集中を妨げたり、未読のまま作品が進行したりする問題を解決します。

## What Changes
- モーダル（検索・ヘルプ・Info）が表示されている間、オートプレイのタイマーを一時停止（サスペンド）します。
- モーダルが閉じられた際、オートプレイの設定が有効であれば自動的にタイマーを再開します。
- Infoモーダル表示時にオートプレイを強制的に OFF にしていた既存の振る舞いを、他モーダルと同様の「一時停止」に統一します。

## Capabilities

### New Capabilities

### Modified Capabilities
- `autoplay-control`: モーダル表示中の動作（一時停止と再開）に関する要件を追加。

## Impact
- `src/managers/Navigator.ts`: オートプレイの開始・停止ロジック。
- `openspec/specs/autoplay-control/spec.md`: 要件の定義。
