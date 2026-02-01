## MODIFIED Requirements

### Requirement: CI環境でのビルド成功
システムは、GitHub Actions などの CI パイプラインにおいて、プロジェクトのビルドプロセス（Vite によるビルドおよび UserScript ヘッダーの結合）がエラーなく完了することを保証しなければならない（SHALL）。生成された成果物において、UserScript ヘッダブロック（`// ==UserScript==` 〜 `// ==/UserScript==`）はファイルの先頭に唯一存在し、重複してはならない（SHALL）。

#### Scenario: ビルドコマンドの正常終了
- **WHEN** CI上で `npm run build` コマンドが実行される
- **THEN** コマンドは終了コード 0 で完了し、ビルドエラーが発生しないこと
- **AND** `dist/` ディレクトリに必要な成果物が生成されること

#### Scenario: UserScript ヘッダの唯一性検証
- **WHEN** ビルドが完了し成果物が生成された
- **THEN** 生成された `.user.js` ファイルの先頭に、正しいメタデータを含むヘッダブロックが1つだけ含まれている
- **AND** ファイル内の他の場所に UserScript ヘッダブロックが重複して存在しない
