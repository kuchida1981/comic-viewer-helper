# Spec Delta

## ADDED Requirements

### Requirement: Logic 層の DOM 非依存の機械的強制
システムは、`src/logic.ts` においてブラウザ固有のグローバルオブジェクト（`window`, `document` 等）および DOM 型（`HTMLElement`, `HTMLImageElement`, `Element`, `Node`, `WheelEvent` 等）の直接参照を ESLint によって禁止しなければならない（SHALL）。また、DOM 操作を行うヘルパー層（`src/dom.ts`）は Logic 層および Shared 層のみに依存できるものとする。

#### Scenario: src/logic.ts での DOM グローバル参照の検出
- **WHEN** `src/logic.ts` 内に `window` や `document` などのブラウザグローバル参照が含まれる状態で `npm run lint` を実行する
- **THEN** ESLint が `no-restricted-globals` エラーを報告し、コマンドが失敗すること

#### Scenario: src/logic.ts での DOM 型参照の検出
- **WHEN** `src/logic.ts` 内に `HTMLElement` や `HTMLImageElement` などの DOM 型参照が含まれる状態で `npm run lint` を実行する
- **THEN** ESLint が `no-restricted-syntax` エラーを報告し、コマンドが失敗すること

#### Scenario: src/dom.ts のレイヤー依存制限
- **WHEN** `src/dom.ts` が Managers 層や Adapters 層をインポートしようとした場合
- **THEN** ESLint が `import-x/no-restricted-paths` エラーを報告すること
