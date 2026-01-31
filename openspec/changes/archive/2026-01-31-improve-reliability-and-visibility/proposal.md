## Why

現在のプロジェクトでは基本的なテストとリンティングが導入されていますが、以下の課題があります：
- テストがコードのどの部分を網羅しているか（カバレッジ）が不明で、複雑な分岐の漏れに気づきにくい。
- DOM操作において、要素の存在（nullチェック）や引数の型が保証されておらず、実行時エラーのリスクがある。
- UserScript固有のメタデータ（@match等）の記述ミスを自動検知できない。

これらの静的解析と測定ツールを導入することで、ブラウザでの動作確認前の信頼性を最大化します。

## What Changes

- Vitest の `coverage-v8` を導入し、テスト網羅率を可視化。
- JSDoc と `tsc --checkJs` を導入し、`logic.js` などの型安全性を向上。
- `eslint-plugin-userscripts` を導入し、UserScript メタデータの妥当性を検証。
- GitHub Actions の CI パイプラインに、上記すべてのチェックを統合。

## Capabilities

### New Capabilities
- `reliability-verification`: テストカバレッジ、静的型チェック、および UserScript 固有の検証を含む、プロジェクトの信頼性を維持するための要件を定義。

### Modified Capabilities
- `ci-pipeline`: CI パイプラインにカバレッジレポートの生成と型チェックのジョブを追加。

## Impact

- `package.json`: 依存関係の追加、および `test`, `lint`, `check-types` スクリプトの更新。
- `vitest.config.mjs`: カバレッジ設定の追加。
- `eslint.config.mjs`: UserScript 用プラグインの設定追加。
- `src/logic.js`: JSDoc アノテーションの追加。
- `.github/workflows/`: CI ワークフローの更新。
