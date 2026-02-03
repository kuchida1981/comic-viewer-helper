## 1. Store & State Management Update

- [x] 1.1 `Store` クラスに `isLoading` ステートを追加し、初期値を `false` に設定する
- [x] 1.2 `Store` の永続化ロジック（`localStorage` 保存/復元）を確認・修正し、`isLoading` が永続化されない（または復元時に無視される）ようにする

## 2. Loading Indicator Component

- [x] 2.1 新規コンポーネント `src/ui/components/LoadingIndicator.js` を作成する（DOM生成、スタイル定義）
- [x] 2.2 `UIManager` に `LoadingIndicator` を組み込み、`Store` の `isLoading` 変更に応じて表示/非表示を切り替えるロジックを追加する

## 3. Navigator Async Logic & Wait

- [x] 3.1 `src/logic.js` または `Navigator.js` に `waitForImageLoad(img, timeout)` ユーティリティ関数を実装する
- [x] 3.2 `Navigator.jumpToPage` を非同期化し、ターゲット画像のロードを待機してからスクロールするように修正する（待機中は `isLoading` を true にする）
- [x] 3.3 `Navigator.scrollToImage` を非同期化し、同様に待機処理を追加する

## 4. Preload Implementation

- [x] 4.1 `src/logic.js` に `preloadImages(images, currentIndex, count)` 関数を実装する（`img.decode()` または `loading="eager"` を使用）
- [x] 4.2 `Navigator.applyLayout` および `Navigator.updatePageCounter` の完了後にプリロード処理を呼び出すように修正する

## 5. Verification & Cleanup

- [x] 5.3 リントチェックとビルド確認を行う
- [x] 5.4 `Navigator` に `pendingTargetIndex` を導入し、ページ遷移中の `applyLayout` によるスクロール位置の巻き戻りを防止する
- [x] 5.5 `loading="lazy"` によるデッドロックを解消するため、遷移対象画像のロードを強制開始する処理を追加する
- [x] 5.6 ページ遷移後のスクロール処理を `applyLayout` に委譲し、レイアウト確定後にスクロールを実行するように修正する
- [x] 5.7 `Navigator.init` の画像ロードリスナーを修正し、遷移中（`pendingTargetIndex`設定中）は自動レイアウト更新を抑制する
- [x] 5.1 手動テスト: 高速ページ送りを行い、ローディングが表示されること、スクロールが正しく完了することを確認する
- [x] 5.2 手動テスト: 見開き表示でジャンプを行い、正しく見開きページが表示されることを確認する
