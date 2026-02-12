## 1. 準備と環境構築

- [ ] 1.1 `eslint-plugin-boundaries` を開発依存関係に追加する
- [ ] 1.2 `eslint.config.mjs` でプラグインをロードする設定を追加する

## 2. レイヤー定義の設定

- [ ] 2.1 `eslint.config.mjs` の `settings` に `boundaries/elements` 定義を追加する
- [ ] 2.2 `Shared` 要素（型定義、ユーティリティ）のパスを正しく定義する
- [ ] 2.3 `Logic`, `Store`, `Adapters`, `UI`, `Managers`, `Entry` の各レイヤーのパスを定義する

## 3. 依存関係ルールの設定

- [ ] 3.1 `eslint.config.mjs` に `boundaries/element-types` ルールを追加し、依存関係の制限を記述する
- [ ] 3.2 テストファイル（`*.test.ts`）に対して依存ルールを緩和するオーバーライド設定を追加する

## 4. 検証と修正

- [ ] 4.1 `npm run lint` を実行し、既存コードに違反がないか最終確認する
- [ ] 4.2 もし違反が検出された場合は、設計に合わせてコードを修正または設定を調整する
- [ ] 4.3 `npx openspec validate --strict --all` で OpenSpec の整合性を確認する
