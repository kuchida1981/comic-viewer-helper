## Why

現在のビューアは画像の上端を画面上端に合わせる挙動（`block: 'start'`）になっており、特に見開き表示時に画像の縦方向のアライメントが上揃えになってしまう問題があります。また、ページ送り機能が座標判定に依存しており、アライメント変更を行うと不安定になるリスクがあります。これらを解消し、閲覧体験を向上させる必要があります。

## What Changes

- 画像のスクロール位置を常に画面中央（`block: 'center'`）に変更し、縦方向のアライメントを中央揃えにします。
- ページ送りのロジックを座標ベースからインデックスベースに変更し、確実なページ移動を実現します。
- `scrollToImage` および `jumpToPage` 関数を新しいアライメントとロジックに合わせて更新します。

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->
- `vertical-alignment`: 画像の縦方向のアライメント制御とビューポートへのフィットに関する仕様

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->
- `navigation-control`: ページ送りのロジック変更に伴うナビゲーション制御の仕様変更
- `page-jump`: ページジャンプ時のスクロール位置指定の変更

## Impact

- `src/main.js`: `scrollToImage`, `jumpToPage`, `toggleDualView` 等のスクロール処理を行う関数全般
- `src/logic.js`: ビューポート計算ロジックへの影響は限定的ですが、アライメント変更に伴う確認が必要
