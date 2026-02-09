### Requirement: 循環的複雑度の制限
コードの保守性とテスト容易性を担保するため、すべての関数およびメソッドの循環的複雑度（Cyclomatic Complexity）は **10** 以下でなければならない（MUST）。

#### Scenario: 複雑度の高い関数の検出
- **WHEN** 複雑度が 11 以上の関数を含むコードに対して `npm run lint` を実行する
- **THEN** ESLint はエラーを報告し、コマンドは失敗する
