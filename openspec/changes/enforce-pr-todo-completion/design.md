## Context

PRの本文に記載されたタスクが完了したかどうかを、マージ前に機械的にチェックする仕組みが必要です。

## Goals / Non-Goals

**Goals:**
- PRの説明文にあるTODOリスト（`- [ ]`）を自動検出し、未完了があればCIを失敗させる。
- PRの作成時および編集時にリアルタイムでフィードバックを提供する。

**Non-Goals:**
- コメント欄のTODOチェック。
- 外部ツール（Jira等）との同期。

## Decisions

### 1. 実装手段: GitHub Actions (shell script)
- **理由**: 特別な外部Actionを導入せずとも、標準の `github.event.pull_request.body` をシェルスクリプトでパースするだけで実現可能で、軽量かつ安全。
- **実装詳細**: 
  ```bash
  echo "$BODY" | grep -q '\- \[ \]'
  ```
  を使用する。

### 2. トリガー: pull_request (opened, edited, synchronize)
- **理由**: PRが作成された時だけでなく、TODOをチェックして説明文を更新した際（edited）や、修正コミットを積んだ際（synchronize）にも再チェックが必要なため。

## Risks / Trade-offs

- **[Risk]**: 意図しないテキストが TODO として誤検知される（例：コードブロック内の `- [ ]`）。
  - **Mitigation**: 一般的なPRの書き方では許容範囲とするが、必要に応じて正規表現を厳密にする。
- **[Risk]**: PR本文が巨大な場合のパフォーマンス。
  - **Mitigation**: シェルスクリプトの `grep` は十分に高速であるため問題にならないと判断。
