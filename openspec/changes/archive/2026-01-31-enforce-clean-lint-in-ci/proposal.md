## Why

現在のプロジェクトには Lint (ESLint) が導入されていますが、警告（Warnings）が存在しており、かつ CI (GitHub Actions) 上で警告がエラーとして扱われないため、潜在的なコードの不備がマージされる可能性があります。
これを解決するために、警告を解消し、将来的に警告を許容しない「Clean Lint」な状態を CI で強制します。

## What Changes

- `src/main.js` 内の未使用関数 `getCurrentPageIndex` を削除し、既存の Lint 警告を解消。
- `package.json` の `lint` スクリプトを更新し、警告をエラーとして扱うオプションを追加。
- CI 上でのリンティングプロセスにおいて、警告が一つでもあれば失敗するように設定を強化。

## Capabilities

### New Capabilities
なし

### Modified Capabilities
- `linting`: リンティングが「警告なし」の状態で成功しなければならないという要件を追加。
- `ci-pipeline`: CI 上でリンティングエラー（警告含む）が発生した場合にジョブを失敗させる要件を明文化。

## Impact

- `src/main.js`: 未使用関数の削除。
- `package.json`: `lint` スクリプトのオプション変更。
- GitHub Actions: リンティングジョブの成功基準の厳格化。
