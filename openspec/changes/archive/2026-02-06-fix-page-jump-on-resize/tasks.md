## 1. Navigator の実装修正

- [x] 1.1 `Navigator.applyLayout` 内での `updatePageCounter` の呼び出しを削除する
- [x] 1.2 `scrollIntoView` がレイアウト更新後に確実に実行されるよう、`requestAnimationFrame` の使用箇所を確認・調整する
- [x] 1.3 フルスクリーン切り替え時の挙動安定化のため、`fullscreenchange` イベントをハンドリングする

## 2. 検証

- [x] 2.1 手動検証: コミックを開き、途中のページまでスクロールした後、ウィンドウサイズを変更してページが飛ばないことを確認する
- [x] 2.2 既存のテストを実行し、デグレードがないことを確認する