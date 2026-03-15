## Why

現在の実装では `localStorage` を使用して設定や履歴を保存していますが、サイト側のストレージ（5MB制限）との競合によるデータ消失リスク、およびサイト側スクリプトからのデータ可視性によるプライバシー上の懸念があります。UserScript 専用の隔離されたストレージ（`GM_setValue` / `GM_getValue`）に移行することで、これらのリスクを排除し、安定性と安全性を向上させます。

## What Changes

- `localStorage` の使用を廃止し、Tampermonkey 等が提供する `GM_setValue`, `GM_getValue`, `GM_deleteValue` を使用した永続化に移行します。
- **BREAKING**: 既存の `localStorage` データは移行（サルベージ）されません。ユーザーの設定や履歴、読書位置はリセットされ、クリーンな状態で開始されます。
- `src/header.ts` の `@grant` 属性を `none` から必要な `GM_` 関数に変更します。
- テスト環境（Vitest）において `GM_` 関数のモックを提供し、ストレージ操作のテストを継続可能にします。

## Capabilities

### New Capabilities
- `gm-storage-integration`: UserScript 専用ストレージ（`GM_setValue` 等）を TypeScript から安全に利用するための基盤機能。

### Modified Capabilities
- `state-management`: 永続化先を `localStorage` から `GM_storage` に変更し、サイト間での設定共有を可能にします。
- `reading-position-persistence`: 読書位置の保存先を `localStorage` から `GM_storage` に変更します。

## Impact

- `src/store.ts`: 永続化ロジックの全面的な書き換え。
- `src/managers/ResumeManager.ts`: 読書位置の保存・読み込みロジックの書き換え。
- `src/header.ts`: メタデータ（`@grant`）の更新。
- `src/global.d.ts`: `GM_` 関数の型定義の追加。
- `src/test/mocks/`: `GM_` 関数のモックの追加。
- 全体のテストコード: `localStorage` を前提としたテストケースの修正。
