## Context

Unstable 版のビルドプロセスにおいて、バージョン番号の付与は行われていますが、`src/header.js` に記述された `@updateURL` および `@downloadURL` の書き換えが行われていません。このため、Unstable 版をインストールしたユーザーの環境では、自動更新チェックが Stable 版に対して行われてしまい、意図しない挙動（更新されない、Stable に戻るなど）を引き起こす可能性があります。

## Goals / Non-Goals

**Goals:**
- Unstable 版ビルド時に、UserScript ヘッダ内の `@updateURL` と `@downloadURL` を `unstable` ブランチを指すように書き換える。
- これにより、Unstable 版ユーザーが常に最新の Unstable 版に自動更新できるようにする。

**Non-Goals:**
- URL の構造自体を変更すること（現状の `githubusercontent` のパス構造を維持）。

## Decisions

### 1. ビルドスクリプト (`scripts/build.mjs`) の修正
- **内容**: `isUnstable` フラグが true の場合、`src/header.js` から読み込んだコンテンツに対し、`/stable/` 文字列を `/unstable/` に置換する処理を追加する。
- **理由**: URL 構造が `.../stable/comic-viewer-helper.user.js` となっており、ブランチ名部分を置換するだけで要件を満たせるため。正規表現による置換が最も低コストで確実。

## Risks / Trade-offs

- **[Risk] 過剰な置換**: URL 以外の部分に `/stable/` という文字列が含まれていた場合、誤って置換してしまう。
  - **Mitigation**: 置換対象を `@updateURL` と `@downloadURL` 行に限定するか、あるいは現状のヘッダ内容的に URL 以外に `stable` が含まれないことを確認する（現状は含まれない）。

## Migration Plan

1. `scripts/build.mjs` を修正。
2. ローカルで `IS_UNSTABLE=true` でビルドし、`dist/` 内のヘッダを確認。
3. マージ後、次回の `master` プッシュで修正が反映される。
