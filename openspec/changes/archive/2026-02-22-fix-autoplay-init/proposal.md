## Why

現在、オートプレイ機能はページロード時やリロード時に自動的に開始されません。特に最終ページからのランダムジャンプ（URL遷移を伴う）を行った際、遷移先でオートプレイが停止してしまうため、継続的な閲覧体験が損なわれています。この変更により、ユーザーの設定に基づいて常にオートプレイが適用されるように修正します。

## What Changes

- `Navigator` クラスの初期化処理（`init` メソッド）において、`Store` の `isAutoplayEnabled` 状態を確認するロジックを追加します。
- `isAutoplayEnabled` が `true` の場合、即座にオートプレイのタイマーを開始するように変更します。

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
(なし)

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `autoplay-control`: ページロード時の自動開始動作を明示的に仕様に含めます。

## Impact

- `src/managers/Navigator.ts`: `init` メソッドの修正。
