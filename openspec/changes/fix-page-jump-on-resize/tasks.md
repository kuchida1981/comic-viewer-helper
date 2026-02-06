## 1. Navigator の実装修正

- [ ] 1.1 `Navigator.applyLayout` 内での `updatePageCounter` の呼び出しを削除する
- [ ] 1.2 `scrollIntoView` がレイアウト更新後に確実に実行されるよう、`requestAnimationFrame` の使用箇所を確認・調整する

## 2. 検証

- [ ] 2.1 手動検証: コミックを開き、途中のページまでスクロールした後、ウィンドウサイズを変更してページが飛ばないことを確認する
- [ ] 2.2 既存のテストを実行し、デグレードがないことを確認する