# Design

## Context

現状の `src/logic.ts` および `eslint.config.mjs` の問題点については [proposal.md](./proposal.md) を参照。

## Goals / Non-Goals

**Goals:**
- `src/logic.ts` からすべての DOM 操作・ブラウザグローバル参照・DOM 型参照を排除し、ESLint ルールで機械的に強制する。
- DOM 操作関数を `src/dom.ts` へ分離し、既存の振る舞いとテストカバレッジ（`src/logic.ts` 100%）を維持する。
- 4 ファイルで無効化されていた `@typescript-eslint/no-unnecessary-condition` を全ファイルで有効化する。

**Non-Goals:**
- DOM レイアウトアルゴリズムや見開き判定ロジック自体の仕様変更。
- `src/dom.ts` 以外の Managers / Adapters の大規模な再設計。

## Decisions

1. **DOM 操作関数の分離先として `src/dom.ts` を新設する**
   - *理由*: 分離対象の関数（`cleanupDOM`, `fitImagesToViewport`, `revertToOriginal`, `getClickNavigationDirection`, `waitForImageLoad`, `forceImageLoad`, `preloadImages`, `getImageElementByIndex`）は `Navigator.ts` と `InputManager.ts` の複数マネージャから共通利用される汎用 DOM ヘルパーであるため、特定の Adapter や Manager に押し込むよりも独立した `src/dom.ts` モジュールに置くのが自然である。
   - *レイヤー制約*: `src/dom.ts` は `src/logic.ts`（`isEligibleForPairing`, `shouldPairWithNext`）と Shared 層（`types.ts` 等）のみ import 可能とし、`src/logic.ts` や `src/store.ts` からは import 不可とする。
2. **`getPrimaryVisibleImageIndex`、`getNavigationDirection`、`normalizeUrl` は純粋関数として `src/logic.ts` に残す**
   - *理由*: これらは本質的に純粋計算であり、引数型から `HTMLImageElement` / `WheelEvent` を外して構造的型（`{ getBoundingClientRect: () => Rect }`, `{ deltaY: number }`）を受け取るようにし、`normalizeUrl(url: string, baseOrigin = 'http://localhost')` とすることで `window` 依存も排除できる。`UIManager.ts` や `store.ts` 等のブラウザ側呼び出し元では `window.location.origin` を第 2 引数に渡す。
3. **`src/logic.ts` の純粋関数制約を `no-restricted-globals` と `no-restricted-syntax` で強制する**
   - *理由*: `eslint.config.mjs` はプロジェクト全体で `globals.browser` を有効にしているため、`src/logic.ts` 専用のルールブロックで `window`, `document` 等のブラウザグローバルを `no-restricted-globals` で禁止し、あわせて `TSTypeReference` の DOM 型参照を `no-restricted-syntax` で禁止することで、再発を機械的に防止できる。
4. **`@typescript-eslint/no-unnecessary-condition` のファイル単位無効化を撤廃する**
   - *理由*: 4 ファイル合計 34 箇所の多くは、不要なオプショナルチェーン（`DefaultAdapter.ts`）、配列要素の冗長チェック（`Navigator.ts`）、または引数の型が `null`/`undefined` を許容していない防御チェック（`logic.ts`, `ui/utils.ts`）である。不要な条件を削除し、意図的に防御的チェックを行う箇所は引数型を `| null | undefined` に広げる等して型と実装を一致させることで、ルールを完全有効化できる。

## Risks / Trade-offs

- [`logic.safety.test.ts` 等のテストが `@ts-expect-error` で `null`/`undefined` を渡している箇所で、防御的チェックを削除するとテストが落ちるリスク] → 引数型に `| null | undefined` を明示するか（あるいはランタイム安全チェックの要件を確認し型定義と整合させる）、テストがすべてパスしカバレッジ 100% を維持することを確認する。
