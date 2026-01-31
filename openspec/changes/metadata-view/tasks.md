# Tasks: metadata-view

## 1. Preparation & Store
- [x] `src/store.js` に `metadata` と `isMetadataModalOpen` の初期状態を追加
- [x] `src/store.js` に `metadata` を更新するための処理を追加（永続化は不要）

## 2. Logic Implementation
- [x] `src/logic.js` に `extractMetadata()` 関数を実装
- [x] `src/logic.js` に対応するテストコードを `src/logic.test.js` に追加（必要に応じて）

## 3. UI Implementation (Styles & Components)
- [x] `src/ui/styles.js` にモーダル、オーバーレイ、タグチップ、関連作品グリッドのスタイルを追加
- [x] `src/ui/components/MetadataModal.js` を新規作成
- [x] GUIパネルに配置する「Info」ボタン用のコンポーネント（または `NavigationButtons.js` への追加）を実装

## 4. Application Integration
- [x] `src/main.js` の `App.init()` で `extractMetadata()` を呼び出し、結果を Store に保存
- [x] `src/main.js` の `updateUI()` を拡張し、`Info` ボタンの追加とモーダルの表示制御を実装
- [x] モーダル表示時のキーボード操作（Escで閉じる）を追加

## 5. Verification
- [x] 実装したセレクタで正しくタイトル、タグ、関連作品が抽出されることを確認
- [x] Infoボタンでモーダルが開き、期待通りのレイアウトで表示されることを確認
- [x] 関連作品のリンクが別タブで正しく開くことを確認
- [x] モーダルを閉じた後に元の閲覧状態に戻ることを確認