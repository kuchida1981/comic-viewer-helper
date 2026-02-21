## 1. 状態管理の拡張 (Store)

- [x] 1.1 `StoreState` に `isAutoplayEnabled` (boolean) と `autoplayInterval` (number) を追加
- [x] 1.2 `STORAGE_KEYS` にオートプレイ関連のキーを追加
- [x] 1.3 `Store` クラスの初期化および永続化ロジック（`_persistChanges`, `localStorage` からの読み込み）にオートプレイ設定を追加

## 2. ナビゲーションロジックの実装 (Navigator)

- [x] 2.1 `Navigator` クラスにタイマー（`setInterval` / `setTimeout`）の保持用プロパティを追加
- [x] 2.2 オートプレイの実行・停止・リセットを行うプライベートメソッド（`_startAutoplay`, `_stopAutoplay`, `_resetAutoplayTimer`）を実装
- [x] 2.3 `Store` の購読処理で `isAutoplayEnabled` または `autoplayInterval` が変更された際にタイマーを更新するロジックを追加
- [x] 2.4 各ナビゲーションメソッド (`scrollToImage`, `jumpToPage`, `scrollToEdge`) の呼び出し時にタイマーをリセットするよう修正
- [x] 2.5 最終ページ到達時の自動停止処理（`isAutoplayEnabled` を `false` に更新）を実装

## 3. UI コンポーネントの追加 (UIManager)

- [x] 3.1 `src/i18n.ts` にオートプレイ関連の翻訳テキスト（日本語・英語）を追加
- [x] 3.2 `src/ui/components/AutoplayControls.ts` を新規作成し、チェックボックスと秒数入力 UI を実装
- [x] 3.3 `src/ui/styles.ts` にオートプレイ UI 用のスタイルを追加
- [x] 3.4 `UIManager` で `AutoplayControls` を初期化し、GUI パネルに配置する
- [x] 3.5 `UIManager.updateUI` でオートプレイの状態を UI に反映する

## 4. ショートカットキーと最終調整

- [x] 4.1 `src/shortcuts.ts` に 'a' キーによるオートプレイのトグル操作を登録
- [x] 4.2 `src/ui/components/HelpModal.ts` および辞書データに 'a' キーの説明が表示されることを確認
- [x] 4.3 全体の動作確認：自動ページ送り、手動操作によるタイマーリセット、最終ページでの停止、永続化の検証
- [x] 4.4 自動テストの作成・更新
