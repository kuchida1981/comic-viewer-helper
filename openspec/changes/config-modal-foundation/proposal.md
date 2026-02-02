## Why

今後、紙めくりエフェクトやGUI表示位置の固定など、ユーザーの好みに合わせたカスタマイズ項目の増加が見込まれます。これらを個別のショートカットやUIで管理するのは限界があるため、一元管理できる「設定画面」の基盤を確立する必要があります。

## What Changes

- 統合設定モーダル（ConfigModal）コンポーネントを新規作成
- ショートカットキー（`,` カンマキー）で設定画面を呼び出し可能にする
- Store を拡張し、GUI表示位置モード（記憶 or 固定）を管理
- 初期設定項目として「見開き表示」と「GUI表示位置モード」を設定可能にする
- 設定変更は即時反映（リアクティブ）

## Capabilities

### New Capabilities
- `config-modal`: 統合設定モーダルの表示・管理機能
- `gui-position-mode`: GUI表示位置の記憶/固定モードの管理機能

### Modified Capabilities
<!-- 既存の仕様に変更はなし。実装の追加のみ -->

## Impact

- 新規ファイル: `src/ui/components/ConfigModal.js`
- 変更ファイル:
  - `src/store.js` - guiPositionMode, isConfigModalOpen の追加
  - `src/managers/UIManager.js` - ConfigModal の表示管理、初期位置決定ロジック
  - `src/shortcuts.js` - config ショートカットの追加
  - `src/main.js` - `,` キーハンドラの追加
  - `src/i18n.js` - 翻訳文字列の追加
- 影響範囲: UI表示、ストア管理、ショートカットシステム