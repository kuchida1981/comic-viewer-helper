## Why

現在の実装では、単一ページ表示から見開き表示に切り替える際、ユーザーが表示しているページがペアの後ろ側（例：30ページ）の場合でも、そのページがペアの開始ページ（例：29-30ページ）として計算され、意図しないペアが表示される問題があります。ユーザーが閲覧中のページを見開きで正しく継続して表示できるように修正する必要があります。

## What Changes

- 単一ページ表示から見開き表示への切り替えロジックを修正します。
- 切り替え時に現在表示しているページが、常に見開きペアの **1ページ目（右側）** となるように計算ロジックを変更します（例：30ページを表示中に切り替えた場合、30-31ページを表示する）。

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `dual-page-view`: 見開き表示切り替え時の開始ページ決定ロジックの要件を修正します。

## Impact

- **Affected Code**: `comic-viewer-helper.user.js` 内のページ切り替え処理（`toggleDualPageView` 関数など）。
- **User Experience**: ページ切り替え時の挙動が改善され、コンテキストの喪失を防ぎます。
