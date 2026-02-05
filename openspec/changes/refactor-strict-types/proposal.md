## Why

初期の TypeScript 移行で段階的導入を優先したため、`any` キャストや `@ts-expect-error` が残存している。
これらを削減し、コンパイル時に型エラーを早期検出できるようにすることで、今後の開発における安全性と信頼性を向上させる。

## What Changes

- `src/store.ts`: `setState` の動的キーアクセスにおける `@ts-expect-error` を削除し、型安全な代入を実現する。
- `src/i18n.ts`: `t` 関数内の `any` キャスト（`result`, `fallback`）を削減し、再帰ネスト辞書へのアクセスを型安全に行う。
- `src/managers/UIManager.ts`: `PowerButtonComponent` インターフェースの戻り値型をより具体的に定義する。
- `src/ui/utils.ts`: 調査の結果、`createElement` はジェネリック型で既に型安全であるため対応不要。

## Capabilities

### New Capabilities
<!-- なし -->

### Modified Capabilities
<!-- 既存spec の要件レベルの変更は伴わない。実装の型精度改善のみ。 -->

## Impact

- 対象ファイル: `src/store.ts`, `src/i18n.ts`, `src/managers/UIManager.ts`
- `any` やサプレッション コメントの削減により、`tsc --strict` での警告が減少する。
- 外部APIや動作の変更なし。内部の型定義のみに影響。