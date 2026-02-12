## Why

UIコンポーネント内（CSS文字列およびインラインスタイル）で色指定がハードコードされており、デザインの一貫性の維持や、将来的なダークモード等のテーマ対応が困難な状態にあります。

## What Changes

- `src/ui/styles.ts` にカラーパレット（`PALETTE`）およびテーマ用定数（`COLORS`）を導入します。
- `src/ui/styles.ts` 内の `styles` 変数（CSS文字列）で使用されているハードコードされた色を、テンプレートリテラルを用いて定数参照に置換します。
- `src/ui/components/HelpModal.ts` 等で使用されているインラインスタイルの色指定を定数参照に置換します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- `ui-architecture`: UIコンポーネントのスタイリングにおける色指定の管理ルールを、定数による一元管理へと変更します。

## Impact

- `src/ui/styles.ts`: スタイル定義の大幅な書き換え。
- `src/ui/components/`: 各コンポーネントにおける色指定箇所の修正。
