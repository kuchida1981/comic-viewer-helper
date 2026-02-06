## Why

`fitImagesToViewport` や `getPrimaryVisibleImageIndex` などの DOM 操作系関数において、対象要素やメソッドが存在しない場合にランタイム例外が発生するリスクがあります。
特に UserScript は動的に変化する外部サイトの DOM に依存するため、予期せぬ要素の欠損や構造の変化に対して堅牢である必要があります。

## What Changes

- `src/logic.ts` における主要な DOM 操作関数への防御的な null/undefined チェックの導入
- `getBoundingClientRect` や `addEventListener` など、ブラウザ API やメソッドの存在確認・型チェックの徹底
- 異常系（要素が見つからない、メソッドが未定義など）をシミュレートしたユニットテストの追加
- 必要に応じて `src/ui/utils.ts` (createElement 等) への安全性向上のための修正

## Capabilities

### New Capabilities
- `dom-operation-safety`: 外部 DOM 操作および要素生成におけるランタイム安全性の確保と、異常系に対するテストの定義。

### Modified Capabilities
- `unit-testing`: 異常系およびエッジケースに対するテストパターンの拡充。

## Impact

- `src/logic.ts`: DOM 操作ロジックの修正
- `src/ui/utils.ts`: 要素生成ユーティリティの修正
- `src/logic.test.ts`: 異常系テストケースの追加
- `src/ui/utils.test.ts`: 安全性に関するテストの追加
