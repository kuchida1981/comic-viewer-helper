## MODIFIED Requirements

### Requirement: TypeScript 開発環境の構築
プロジェクト全体で TypeScript をネイティブにサポートし、型チェックとコンパイルが正常に行われる環境を SHALL 構築する。テストコード (`src/**/*.test.ts`) についても `// @ts-nocheck` なしで型チェックが通過することを SHALL 保証する。

#### Scenario: 型チェックの実行
- **WHEN** `npm run check-types` (または `tsc`) を実行したとき
- **THEN** 実装コードおよびテストファイルを含むプロジェクト全体の型チェックが行われ、エラーがない場合は正常終了する

#### Scenario: ビルドプロセスの完了
- **WHEN** `npm run build` を実行したとき
- **THEN** `src/*.ts` ファイルがコンパイル・結合され、UserScript ヘッダーが付与された `dist/comic-viewer-helper.user.js` が生成される
