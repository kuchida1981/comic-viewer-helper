## 1. 準備

- [ ] 1.1 `src/ui/icons.ts` を新規作成し、ハートアイコン（Outline/Filled）のSVG生成関数を実装する

## 2. スタイリングの更新

- [ ] 2.1 `src/ui/styles.ts` の `.comic-helper-favorite-btn` に `display: inline-flex` および中央揃えのスタイルを追加する
- [ ] 2.2 SVGアイコンのサイズ（18px程度）をスタイルシートで定義する

## 3. UIコンポーネントの更新

- [ ] 3.1 `src/ui/components/NavigationButtons.ts` のお気に入りボタンの実装をSVGアイコンを使用するように変更する
- [ ] 3.2 `src/ui/components/MetadataModal.ts` のお気に入りボタンの実装をSVGアイコンを使用するように変更する

## 4. 検証

- [ ] 4.1 お気に入り登録/解除時にUIの高さが変化しないことを目視および開発者ツールで確認する
- [ ] 4.2 既存のテスト（`MetadataModal.test.ts`等）がパスすることを確認し、必要に応じて修正する
