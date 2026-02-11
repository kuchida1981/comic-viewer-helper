# Proposal: fix-help-modal-alignment

## Why

ヘルプモーダルのキーボードショートカット一覧で、キーの個数が異なることにより説明文（description）の開始位置が揃わず、視覚的に非常に読みにくい状態になっている。この問題は、現在のFlexboxレイアウト（`justify-content: space-between`と`flex: 1`の組み合わせ）により、キー列の幅が変動すると後続の列の位置もずれることが原因である。イシュー #182 で報告されたこの問題を修正し、すべての説明文が縦に揃った読みやすいレイアウトに改善する。

## What Changes

- ヘルプモーダルのショートカット行（`.comic-helper-shortcut-row`）のレイアウトを、FlexboxからCSS Grid Layoutに変更する
- キー列、ラベル列、説明文列の各列幅を固定または制御可能にし、すべての行で説明文の開始位置を揃える
- レイアウトの変更に伴い、各列のスタイル調整を行う（marginの削除など）

## Capabilities

### New Capabilities

なし

### Modified Capabilities

なし（要件レベルの変更ではなく、実装の改善）

## Impact

- **影響を受けるファイル**:
  - `src/ui/styles.ts`: `.comic-helper-shortcut-row`, `.comic-helper-shortcut-keys`, `.comic-helper-shortcut-label`, `.comic-helper-shortcut-desc` のスタイル定義を変更
- **影響を受けるコンポーネント**:
  - `src/ui/components/HelpModal.ts`: HTMLの構造変更は不要だが、CSSクラスの動作が変わる
- **ユーザー影響**:
  - ヘルプ画面の視覚的改善により、キーボードショートカット一覧がより読みやすくなる
  - 機能的な動作変更はなし
- **後方互換性**: 破壊的変更なし