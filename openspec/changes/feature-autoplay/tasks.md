## 1. 状態管理の準備

- [x] 1.1 `Store.ts` に `isAutoplayEnabled` 状態を追加し、永続化（localStorage）を設定する
- [x] 1.2 `types.ts` または `store.ts` の `StoreState` インターフェースを更新する

## 2. オートプレイロジックの実装

- [x] 2.1 `src/managers/AutoplayManager.ts` を新設し、タイマー制御ロジックを実装する
- [x] 2.2 `AutoplayManager` を `App.init` (`src/main.ts`) で初期化し、Store を購読してタイマーを開始/停止するようにする
- [x] 2.3 `Navigator.ts` または `AutoplayManager` 内で、最終ページ到達時の `jumpToRandomWork` 呼び出しを実装する

## 3. 手動介入による停止の実装

- [x] 3.1 `InputManager.ts` のキーボード、マウス、ホイールイベントハンドラに `isAutoplayEnabled: false` にする処理を追加する

## 4. UIの実装

- [x] 4.1 `src/ui/components/NavigationButtons.ts` にオートプレイ開始/停止ボタン（▶/||）を追加する
- [x] 4.2 `UIManager.ts` でオートプレイ状態に応じたボタン表示の更新ロジックを追加する
- [x] 4.3 `i18n.ts` にオートプレイ関連の翻訳テキスト（日本語・英語）を追加する

## 5. 検証とテスト

- [x] 5.1 `AutoplayManager.test.ts` を作成し、タイマーの発火と停止のユニットテストを記述する
- [x] 5.2 実際のページでオートプレイが動作し、読了後に作品ジャンプすることを確認する
- [x] 5.3 手動操作で正しくオートプレイが解除されることを確認する
