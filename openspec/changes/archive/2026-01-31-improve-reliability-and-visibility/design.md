## Context

現状、Vitest による単体テストと ESLint による静的解析が行われているが、以下の点が「暗黙的」または「手動」に頼っている：
- テストが十分に実行されているかどうかの判断（カバレッジの欠如）。
- ブラウザの API や DOM 要素が確実に存在するか、期待通りの型であるかの保証（型の欠如）。
- UserScript として正しく構成されているか（メタデータの検証漏れ）。

## Goals / Non-Goals

**Goals:**
- テストカバレッジの自動計測と 90% 以上の維持。
- JSDoc と TypeScript (tsc) を用いた、コードの変更を伴わない静的型チェックの導入。
- UserScript 固有の Lint ルールの導入。
- CI 上での自動検証プロセスの統合。

**Non-Goals:**
- TypeScript へのコードベースの完全移行（ビルドプロセスの複雑化を避けるため）。
- E2E テスト (Playwright/Puppeteer) の導入（今回はスコープ外）。
- 既存ロジックの大幅なリファクタリング（型定義の追加に伴う最小限の修正に留める）。

## Decisions

- **Decision 1: `coverage-v8` の採用**
    - 理由: Vitest との親和性が高く、ネイティブ V8 のカバレッジ機能を利用するため高速かつ正確。
- **Decision 2: JSDoc + `tsc --checkJs` による型チェック**
    - 理由: `.ts` ファイルへの移行をせず、実行コードをピュアな JS のまま保ちつつ、開発時に型安全性を享受できるため。
- **Decision 3: `eslint-plugin-userscripts` の導入**
    - 理由: 手動確認が難しい `@match` や `@grant` などのメタデータヘッダーのミスを確実に防ぐため。

## Risks / Trade-offs

- **[Risk] JSDoc の記述負担**
    - → [Mitigation] すべての関数に一度に付与するのではなく、まず `logic.js` の公開 API と重要な内部関数から優先的に付与する。
- **[Risk] 型チェックによる擬陽性（False Positives）**
    - → [Mitigation] `null` チェックを明示的に行うコードに修正することで、むしろ実行時の安全性を高める機会とする。
- **[Risk] CI の実行時間増加**
    - → [Mitigation] 型チェックとカバレッジ測定は軽量なため、大きな影響はないと判断。
