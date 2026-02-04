## Why

ランダムジャンプ（おすすめ）機能は現在GUIボタンのみで発火可能であり、キーボード中心の閲覧スタイルでは毎回マウスに戻る必要がある。キーボード・ショートカットを追加することで、キーボード操作の流れを途切れずに利用できるようにする。

## What Changes

- `lucky-navigation` spec に、キーボード・ショートカットによるランダムジャンプの発火要件を追加する
- `src/shortcuts.js` に新しいショートカットエントリを追加する
- `src/managers/InputManager.js` に新キーハンドラの接続を追加する
- `src/i18n.js` に対応する多言語キーを追加する
- キーの割り当ては右手側キーを優先し、実装前に議論で決定する（候補: `p`, `l`, `u` など。参照: #114）

## Capabilities

### New Capabilities
（なし）

### Modified Capabilities
- `lucky-navigation`: キーボード・ショートカットによる発火手段を追加する新要件を追加する。現在はGUIボタンのみを想定している Scenario に、キー操作による発火の Scenario を追加する

## Impact

- `src/shortcuts.js`: 新エントリの追加
- `src/managers/InputManager.js`: 新キーハンドラの追加
- `src/i18n.js`: 多言語キーの追加
- `openspec/specs/lucky-navigation/spec.md`: キーボード発火の要件・Scenario を追加