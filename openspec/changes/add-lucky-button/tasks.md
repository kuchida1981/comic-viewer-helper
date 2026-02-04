## Tasks

- [ ] `src/i18n.js` に翻訳テキストを追加
    - [ ] `ja.ui.lucky`: "おすすめ（ランダム）"
    - [ ] `en.ui.lucky`: "I'm feeling lucky"
- [ ] `src/ui/components/NavigationButtons.js` を拡張
    - [ ] `createNavigationButtons` の引数に `onLucky` を追加
    - [ ] `configs` 配列に 🎲 ボタンの設定を追加（`onLucky` が存在する場合のみ）
- [ ] `src/managers/UIManager.js` でランダム遷移ロジックを実装
    - [ ] `updateUI()` 内で `onLucky` コールバックを定義
    - [ ] `metadata.relatedWorks` からランダムに1つ選ぶロジックの実装
    - [ ] 選択された作品の `href` への `window.location.href` 更新処理の追加
    - [ ] `relatedWorks` が空の場合にボタンを表示しない（または `onLucky` を渡さない）制御の追加
- [ ] 動作確認
    - [ ] 関連作品があるページで 🎲 ボタンが表示され、クリックでランダムに遷移することを確認
    - [ ] 関連作品がないページで 🎲 ボタンが表示されないことを確認
    - [ ] 日本語・英語それぞれの環境でツールチップが正しいことを確認
