## 1. Store & State Management Update

- [ ] 1.1 `Store` クラスに `isLoading` ステートを追加し、初期値を `false` に設定する
- [ ] 1.2 `Store` の永続化ロジック（`localStorage` 保存/復元）を確認・修正し、`isLoading` が永続化されない（または復元時に無視される）ようにする

## 2. Loading Indicator Component

- [ ] 2.1 新規コンポーネント `src/ui/components/LoadingIndicator.js` を作成する（DOM生成、スタイル定義）
- [ ] 2.2 `UIManager` に `LoadingIndicator` を組み込み、`Store` の `isLoading` 変更に応じて表示/非表示を切り替えるロジックを追加する

## 3. Navigator Async Logic & Wait

- [ ] 3.1 `src/logic.js` または `Navigator.js` に `waitForImageLoad(img, timeout)` ユーティリティ関数を実装する
- [ ] 3.2 `Navigator.jumpToPage` を非同期化し、ターゲット画像のロードを待機してからスクロールするように修正する（待機中は `isLoading` を true にする）
- [ ] 3.3 `Navigator.scrollToImage` を非同期化し、同様に待機処理を追加する

## 4. Preload Implementation

- [ ] 4.1 `src/logic.js` に `preloadImages(images, currentIndex, count)` 関数を実装する（`img.decode()` または `loading="eager"` を使用）
- [ ] 4.2 `Navigator.applyLayout` および `Navigator.updatePageCounter` の完了後にプリロード処理を呼び出すように修正する

## 5. Verification & Cleanup

- [ ] 5.1 手動テスト: 高速ページ送りを行い、ローディングが表示されること、スクロールが正しく完了することを確認する
- [ ] 5.2 手動テスト: 見開き表示でジャンプを行い、正しく見開きページが表示されることを確認する
- [ ] 5.3 リントチェックとビルド確認を行う
