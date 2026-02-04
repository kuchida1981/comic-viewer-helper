# typescript-toolchain Specification

## Purpose
TBD - created by archiving change typescript-migration. Update Purpose after archive.
## Requirements
### Requirement: TypeScript 開発環境の構築
プロジェクト全体で TypeScript をネイティブにサポートし、型チェックとコンパイルが正常に行われる環境を SHALL 構築する。

#### Scenario: 型チェックの実行
- **WHEN** `npm run check-types` (または `tsc`) を実行したとき
- **THEN** `.ts` ファイルを含むプロジェクト全体の型チェックが行われ、エラーがない場合は正常終了する

#### Scenario: ビルドプロセスの完了
- **WHEN** `npm run build` を実行したとき
- **THEN** `src/*.ts` ファイルがコンパイル・結合され、UserScript ヘッダーが付与された `dist/comic-viewer-helper.user.js` が生成される

### Requirement: TypeScript 対応の静的解析
TypeScript の型情報を活用した ESLint による静的解析を SHALL 導入する。

#### Scenario: リントの実行
- **WHEN** `npm run lint` を実行したとき
- **THEN** `typescript-eslint` によって `.ts` ファイルの静的解析が行われ、定義済みのルールに従って警告またはエラーが表示される

