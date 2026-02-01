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

* 動作確認に問題がなく, コードレビューを受けてその対応が完了したら, OpenSpec提案をverify/archiveし, コミット/プッシュしてください
* そのあとユーザーにプルリクエストをマージするように促してください
