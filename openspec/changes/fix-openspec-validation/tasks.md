## 1. ドキュメントの修正

- [x] 1.1 `openspec/specs/activation-toggle/spec.md` のフォーマットエラー（インデント等）を修正する
- [x] 1.2 `openspec/specs/ci-testing/spec.md` のフォーマットエラーを修正する
- [x] 1.3 `openspec/specs/multilingual-support/spec.md` のフォーマットエラーを修正する
- [x] 1.4 `openspec/specs/page-jump/spec.md` のフォーマットエラーを修正する
- [x] 1.5 `openspec/specs/pr-enforcement/spec.md` のフォーマットエラーを修正する
- [x] 1.6 ローカル環境で `npx openspec validate --strict --all` がパスすることを確認する

## 2. CI の設定

- [x] 2.1 `.github/workflows/lint.yml` に OpenSpec のバリデーションを実行するステップを追加する
- [x] 2.2 プッシュして CI が正常に動作（バリデーション成功）することを確認する

## 3. フィードバック対応

- [x] 3.1 `src/global.d.ts` での `no-unused-vars` エラーを解消するため、ESLint 設定を修正する
- [x] 3.2 `lint.yml` からバリデーションステップを削除し、独立した `check-docs.yml` を作成する
