## Tasks

- [x] `src/i18n.js` に翻訳テキストを追加
    - [x] `ja.ui.lucky`: "おすすめ（ランダム）"
    - [x] `en.ui.lucky`: "I'm feeling lucky"
- [x] `src/ui/components/NavigationButtons.js` を拡張
    - [x] `createNavigationButtons` の引数に `onLucky` を追加
    - [x] `configs` 配列に 🎲 ボタンの設定を追加（`onLucky` が存在する場合のみ）
- [x] `src/managers/UIManager.js` でランダム遷移ロジックを実装
    - [x] `updateUI()` 内で `onLucky` コールバックを定義
    - [x] `metadata.relatedWorks` からランダムに1つ選ぶロジックの実装
    - [x] 選択された作品の `href` への `window.location.href` 更新処理の追加
    - [x] `relatedWorks` が空の場合にボタンを表示しない（または `onLucky` を渡さない）制御の追加
- [x] 動作確認
    - [x] 関連作品があるページで 🎲 ボタンが表示され、クリックでランダムに遷移することを確認
    - [x] 関連作品がないページで 🎲 ボタンが表示されないことを確認
    - [x] 日本語・英語それぞれの環境でツールチップが正しいことを確認
