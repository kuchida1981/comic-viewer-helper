## Why

現在の「Adjust」ボタンの名称は機能（見開きの開始位置をずらす）を直感的に表しておらず、ユーザーにとって挙動が分かりにくい課題があります。また、見開きのズレを修正する操作は頻繁に発生し得るため、マウス操作に加えてキーボードショートカットを提供することで閲覧体験を向上させる必要があります。

## What Changes

- **GUI表現の変更**:
  - ボタンテキストを `Adjust` から `Offset` に変更します。
  - ツールチップ (`title`) を `Adjust Spread Alignment` から `Shift spread pairing by 1 page (Offset)` に更新し、具体的な挙動を説明します。
- **キーボードショートカットの追加**:
  - `o` キー (Offset) を押すことで、見開きのオフセット状態（0 ↔ 1）をトグルできるようにします。
  - このショートカットは、スクリプトが有効かつ見開きモードが有効な場合のみ機能します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `spread-adjustment`: UIテキストの変更（Adjust -> Offset）と、ショートカットキーによる操作のサポートを追加します。
- `navigation-control`: 利用可能なキーボードショートカットのリストに `o` キーを追加します。

## Impact

- `src/ui/components/SpreadControls.js`: ボタンのラベルとタイトル属性の変更。
- `src/main.js`: キーボードイベントハンドラ (`onKeyDown`) への `o` キーの処理追加。
- `openspec/specs/spread-adjustment/spec.md`: 要件の更新。
- `openspec/specs/navigation-control/spec.md`: 要件の更新。
