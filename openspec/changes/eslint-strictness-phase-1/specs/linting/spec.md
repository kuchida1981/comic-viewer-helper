## MODIFIED Requirements

### Requirement: 警告の厳格な処理
システムは、Lint の警告（Warning）もエラーとして扱い、ビルドや CI を失敗させなければならない（SHALL）。また、静的解析には TypeScript の型情報を利用し、型レベルでの不安全な操作も検出対象としなければならない（SHALL）。

#### Scenario: 警告が存在する場合の失敗
- **WHEN** ソースコードに Lint 警告が含まれている状態で `npm run lint` を実行する
- **THEN** コマンドは終了コード 非 0 で終了すること

#### Scenario: 型情報が必要なルールの検証
- **WHEN** `npm run lint` を実行したとき
- **THEN** ESLint は TypeScript の型情報を参照して解析を行い、型に関連する違反も報告すること
