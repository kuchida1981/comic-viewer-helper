## 1. Store の拡張

- [ ] 1.1 `STORAGE_KEYS.GUI_POSITION_MODE` を追加
- [ ] 1.2 `STORAGE_KEYS.CONFIG_MODAL` を追加
- [ ] 1.3 `StoreState` に `guiPositionMode: 'remember' | 'fixed'` を追加
- [ ] 1.4 `StoreState` に `isConfigModalOpen: boolean` を追加
- [ ] 1.5 `Store` コンストラクタで `guiPositionMode` を localStorage から読み込み（デフォルト: `'remember'`）
- [ ] 1.6 `Store` コンストラクタで `isConfigModalOpen` を初期化（デフォルト: `false`）
- [ ] 1.7 `setState` に `guiPos` の条件付き保存ロジックを追加（`guiPositionMode === 'remember'` のときのみ保存）
- [ ] 1.8 `setState` に `guiPositionMode` の保存ロジックを追加（localStorage に保存）
- [ ] 1.9 `setState` に `isConfigModalOpen` の保存ロジックを追加（localStorage に保存）

## 2. i18n の拡張

- [ ] 2.1 `shortcuts.config.label` を追加（日本語: "設定"、英語: "Settings"）
- [ ] 2.2 `shortcuts.config.desc` を追加（日本語: "設定画面を開く"、英語: "Open settings"）
- [ ] 2.3 `ui.settings` を追加（日本語: "設定"、英語: "Settings"）
- [ ] 2.4 `ui.displaySettings` を追加（日本語: "表示設定"、英語: "Display Settings"）
- [ ] 2.5 `ui.dualView` を追加（日本語: "見開き表示"、英語: "Dual View"）
- [ ] 2.6 `ui.dualViewDesc` を追加（日本語: "2ページを並べて表示します"、英語: "Display two pages side by side"）
- [ ] 2.7 `ui.guiPosition` を追加（日本語: "GUI表示位置"、英語: "GUI Position"）
- [ ] 2.8 `ui.guiPositionRemember` を追加（日本語: "前回の位置を記憶する"、英語: "Remember previous position"）
- [ ] 2.9 `ui.guiPositionFixed` を追加（日本語: "固定位置に表示する"、英語: "Fixed position"）
- [ ] 2.10 `ui.guiPositionDesc` を追加（日本語: "前回表示した位置を記憶します。固定位置では常に右下に表示されます。"、英語: "Remember the previous position. Fixed position always displays in the bottom right."）

## 3. ConfigModal コンポーネントの実装

- [ ] 3.1 `src/ui/components/ConfigModal.js` を作成
- [ ] 3.2 `createConfigModal` 関数を実装（引数: `{ onClose, isDualViewEnabled, guiPositionMode, onDualViewChange, onGuiPositionModeChange }`）
- [ ] 3.3 閉じるボタン（×）を実装
- [ ] 3.4 モーダルタイトルを実装（"設定"）
- [ ] 3.5 見開き表示トグルスイッチを実装
- [ ] 3.6 GUI表示位置モードのラジオボタンを実装
- [ ] 3.7 説明文を実装
- [ ] 3.8 オーバーレイクリックで閉じる処理を実装
- [ ] 3.9 既存モーダルと同じクラス名を使用（`comic-helper-modal-overlay`, `comic-helper-modal-content`, `comic-helper-modal-close`）
- [ ] 3.10 `update` メソッドを実装（状態変更時にトグルとラジオボタンを更新）

## 4. UIManager の拡張

- [ ] 4.1 `UIManager` に `configModalEl` プロパティを追加
- [ ] 4.2 `UIManager` に `_getFixedPosition()` メソッドを実装（固定位置: `{ top: innerHeight - 150, left: innerWidth - 220 }`）
- [ ] 4.3 `UIManager.init()` で初期位置決定ロジックを更新（`guiPositionMode === 'fixed'` なら固定位置、それ以外なら保存された位置）
- [ ] 4.4 `UIManager.updateUI()` に ConfigModal の表示管理を追加（`isConfigModalOpen` が true ならモーダルを表示）
- [ ] 4.5 ConfigModal の `onDualViewChange` コールバックを実装（Store の `isDualViewEnabled` を更新）
- [ ] 4.6 ConfigModal の `onGuiPositionModeChange` コールバックを実装（Store の `guiPositionMode` を更新）

## 5. ショートカットの追加

- [ ] 5.1 `shortcuts.js` に config ショートカットを追加（id: 'config', keys: [',']）
- [ ] 5.2 `main.js` の `setupKeyboardShortcuts` に `,` キーハンドラを追加（`store.setState({ isConfigModalOpen: true })`）

## 6. テストとスタイル調整

- [ ] 6.1 ConfigModal が `,` キーで開くことを確認
- [ ] 6.2 ConfigModal が閉じるボタン、オーバーレイクリック、Escape キーで閉じることを確認
- [ ] 6.3 見開き表示トグルが即時反映されることを確認
- [ ] 6.4 GUI位置モードの切り替えが localStorage に保存されることを確認
- [ ] 6.5 記憶モードでドラッグ後の位置が保存されることを確認
- [ ] 6.6 固定モードでドラッグ後の位置が保存されないことを確認
- [ ] 6.7 固定モードで次回ページ表示時に固定位置に表示されることを確認
- [ ] 6.8 既存モーダルとデザインが統一されていることを確認
- [ ] 6.9 必要に応じて CSS スタイルを調整
