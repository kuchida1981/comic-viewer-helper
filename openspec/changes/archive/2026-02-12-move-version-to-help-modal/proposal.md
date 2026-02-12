## Why

現在、アプリケーションのバージョン情報は `MetadataModal`（タグ検索結果などを表示するモーダル）に表示されています。しかし、アプリケーションのバージョンや状態を確認する場所としては、ショートカットヘルプなどを提供する `HelpModal` の方がユーザーにとって自然で発見しやすい場所です。この変更により、UIの整合性とユーザビリティを向上させます。

## What Changes

- `MetadataModal` からバージョン情報の表示を削除します。
- `HelpModal` にバージョン情報（バージョン番号と安定版/開発版の区別）を追加します。
- バージョン情報のスタイルを `HelpModal` のデザインに合わせて微調整します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- help-display: ヘルプモーダルにバージョン情報を表示する要件を追加します。
- metadata-view: メタデータモーダルからバージョン情報を削除する要件に変更します。

## Impact

- `src/ui/components/HelpModal.ts`: バージョン表示ロジックの追加。
- `src/ui/components/MetadataModal.ts`: バージョン表示ロジックの削除。
- `src/ui/components/components.test.ts`: 各モーダルの表示内容に関するテストの更新。
