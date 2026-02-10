---
name: development-workflow
description: このプロジェクトにおける開発ワークフロー
metadata:
  author: Kosuke Uchida
  version: "1.0"
---

Use this skill when performing any development-related task in this project,
including feature implementation, refactoring, bug fixing, or code review support.

Follow the development workflow described below strictly.
Do not skip steps unless the user explicitly instructs otherwise.

If the workflow has not yet reached the "implementation" step,
do not write production code.

When creating a pull request, always include a TODO checklist
for user verification in the PR description.

# このプロジェクトにおける開発ワークフロー

このプロジェクトにおける開発のワークフロー (主な流れ) を示します

## 前提

* GitHub Flow を使います
* デフォルトブランチは master です
* GitHub イシューをドリブンにします
* OpenSpec 提案を作成し, レビューを経て実装
* 必ず, ユーザーの動作確認を経ることとします
* 開発者向けガイドはREADMEにも記載されています

## 流れについて

### Git操作に関する重要ルール

* **一括ステージングの禁止**: `git add .` や `git add -A` は原則として使用しないでください。意図しないファイル（一時ファイルや設定ファイルなど）が混入する原因となります。
* **明示的な指定**: 変更したファイルやディレクトリを明示的に指定してステージングしてください（例: `git add src/logic.js src/logic.test.js`）。
* **状態確認**: コミットする前に必ず `git status` を実行し、ステージングされたファイルが意図通りか確認してください。

### GitHubのイシューを確認する

* 基本的にはユーザーが対象のイシューを提示するので, まずその内容を理解する必要があります.
* 場合によっては, 自分自身でイシューを作成するケースもありえます.

### OpenSpec提案を作成する

* あらゆる機能追加やリファクタリング, バグ修正のためにOpenSpec による提案を作成します
* イシューの内容とユーザーとの協議を行いつつ作成することになるはずです.

### トピックブランチを作成し, 提案をコミットする

* GitHub Flow を使うので, 変更のためのトピックブランチを作成してください.
* そのブランチでOpenSpec提案ファイルをコミットします.

### 実装する

* 実装し, 追加・変更したコードをコミットします.
* READMEやドキュメントへの反映が必要かどうか気にかけてください

### プルリクエストを作成する

* トピックブランチをpushし, プルリクエストを作成します.
* このとき, プルリクエストのbodyにユーザーによる動作確認のためのTODOリストを作成してください.
* ユーザーにプルリクエストを提示し, 動作確認することをもとめてください
* プルリクエストにイシューを紐づけることを忘れないでください

### コードレビューと動作確認のあと, OpenSpec提案をverify/archive する

* OpenSpec 提案を検証・アーカイブする際, `dist/` ディレクトリ配下のファイル（ビルド成果物）はコミットに含めないでください. これらは `.gitignore` で除外されています.
* そのあとユーザーにプルリクエストをマージするように促してください
