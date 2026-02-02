---
name: development-workflow
description: このプロジェクトの開発ワークフローを確認・実行する。機能追加、リファクタリング、バグ修正の際に使用。
invocable: true
metadata:
  author: Kosuke Uchida
  version: "1.0"
---

このプロジェクトにおける開発ワークフローを実行します。

**このスキルを使うタイミング**:
- 新機能の実装を始めるとき
- バグ修正を行うとき
- リファクタリングを行うとき
- 開発ワークフローの手順を確認したいとき

## ワークフロー概要

このプロジェクトでは以下のワークフローに従います:

1. **GitHub Issue の確認** → イシュー内容を理解
2. **OpenSpec 提案の作成** → 変更内容を提案として文書化
3. **トピックブランチ作成** → GitHub Flow に従いブランチを作成し、提案をコミット
4. **実装** → コードを実装しコミット
5. **プルリクエスト作成** → PRを作成（動作確認用TODOリスト必須）
6. **レビュー・動作確認後** → OpenSpec を verify/archive してマージを依頼

## ステップ実行

### ステップ1: 現在の状況を確認

ユーザーに以下を確認してください:
- 対象となるGitHub Issue（あれば）
- 何を実装・修正したいか

### ステップ2: OpenSpec 提案の作成

`openspec-new-change` スキルを使って提案を作成します:
```
/openspec-new-change
```

### ステップ3: トピックブランチ作成

```bash
git checkout -b <branch-name>
git add openspec/changes/<change-name>/
git commit -m "proposal: <change-name>"
```

### ステップ4: 実装

- OpenSpec の提案に基づいて実装
- `openspec-apply-change` スキルを使用可能
- README やドキュメントの更新が必要か確認

### ステップ5: プルリクエスト作成

```bash
git push -u origin <branch-name>
gh pr create --title "<title>" --body "..."
```

**重要**: PR の body には必ず動作確認用の TODO チェックリストを含めること:
```markdown
## 動作確認

- [ ] 機能Aが正しく動作する
- [ ] 既存機能に影響がない
- [ ] エラーケースが適切に処理される
```

### ステップ6: レビュー・動作確認後

動作確認が完了したら:
```
/openspec-verify-change
/openspec-archive-change
```

その後、ユーザーにPRのマージを依頼してください。

## ガードレール

- **実装ステップに到達するまで本番コードを書かないこと**
- **ユーザーの動作確認を飛ばさないこと**
- **PRには必ず動作確認用TODOリストを含めること**
