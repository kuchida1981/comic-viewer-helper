## 1. 準備

- [ ] 1.1 トピックブランチ `feature/issue-link-enforcement` を作成する

## 2. PRテンプレートの作成

- [ ] 2.1 `.github/pull_request_template.md` を作成する
- [ ] 2.2 テンプレートに背景、目的、イシュー番号（#番号）、TODOリストを含める

## 3. GitHub Actions の実装

- [ ] 3.1 `.github/workflows/check-pr-issue.yml` を作成する
- [ ] 3.2 `actions/github-script` を使用して、タイトルと本文のイシュー番号を検証するロジックを実装する
- [ ] 3.3 イシュー番号がない場合に警告（Warning）を出すように構成する

## 4. 検証

- [ ] 4.1 `npx openspec validate --strict --all` を実行して整合性を確認する
- [ ] 4.2 プルリクエストを作成し、GitHub Actions が正しくトリガーされることを確認する（マニュアル検証）
