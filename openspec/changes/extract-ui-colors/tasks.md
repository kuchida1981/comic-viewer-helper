## 1. 定義の作成

- [ ] 1.1 `src/ui/styles.ts` に `PALETTE`（基本色）および `COLORS`（用途別色）定数を定義する
- [ ] 1.2 `COLORS` 定数をエクスポートし、外部コンポーネントから利用可能にする

## 2. スタイル定義の置換

- [ ] 2.1 `src/ui/styles.ts` 内の `styles` 変数で使用されているハードコードされた色を、`COLORS` 定数への参照に置換する
- [ ] 2.2 `styles` 内の残りのハードコードされた色（`rgba`等）も可能な限り定数化する

## 3. コンポーネントの修正

- [ ] 3.1 `src/ui/components/HelpModal.ts` 内のインラインスタイルを `COLORS` 参照に置換する
- [ ] 3.2 `src/ui/components/PowerButton.ts` 内のインラインスタイルを `COLORS` 参照に置換する
- [ ] 3.3 その他、コンポーネント内で直接指定されている色が残っていないか確認し、あれば置換する

## 4. 検証

- [ ] 4.1 プロジェクトのビルドが正常に完了することを確認する (`npm run build`)
- [ ] 4.2 既存のテストがすべてパスすることを確認する (`npm run test`)
- [ ] 4.3 OpenSpecの検証を実行し、成果物の不整合がないことを確認する (`npx openspec validate --strict --all`)
