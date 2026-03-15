## Context

現在の実装では、`Store` クラスと `ResumeManager` クラスがブラウザ標準の `localStorage` API を直接呼び出してデータの永続化を行っています。このアプローチには以下の制限があります。
- サイト側のストレージ容量（通常5MB）を消費し、競合のリスクがある。
- サイト側スクリプトからデータが閲覧・操作可能である。
- 同一スクリプトであっても、異なるドメイン（サイト）間ではデータ（設定等）が共有されない。

## Goals / Non-Goals

**Goals:**
- ストレージエンジンを `localStorage` から Tampermonkey 互換の `GM_storage` (`GM_setValue`/`GM_getValue`) に移行する。
- データの秘匿性と保存の安定性を確保する。
- 設定（ON/OFF、GUI位置等）を、スクリプトが動作する全サイトで共通化する。
- ユニットテスト環境で `GM_storage` を適切にモック化し、テストカバレッジを維持する。

**Non-Goals:**
- 既存の `localStorage` データの移行（サルベージ）ロジックの実装。
- `localStorage` 以外のストレージ（IndexedDB 等）への移行。
- メタデータ `@grant` 以外のビルド設定の変更。

## Decisions

### 1. ストレージキーのスコープ設計
`GM_storage` は同一 UserScript であれば複数ドメイン間で共有されます。移行に伴い、データのスコープを以下のように整理します。

- **Global (全サイト共通)**:
  - `enabled`, `isDualViewEnabled`, `guiPos`, `isAutoplayEnabled`, `autoplayInterval`
  - これにより、あるサイトで設定した GUI 位置や ON/OFF 状態が他のサイトでも反映されるようになります。
- **Site-local (ドメインごと)**:
  - `searchQuery`, `searchContext`, `searchCache`, `searchHistory`, `favorites`, `luckyHistory`, `resume-data`
  - これらはホスト名をキーに含めることで、従来通りドメインごとの独立性を維持します。

### 2. データ移行戦略: 「クリーンスタート」
実装コストと複雑さを避けるため、既存データの移行は行いません。
- **Rationale**: UserScript 開発において、異なるドメインの `localStorage` からデータを集めるのは困難（または不可能）であり、同一ドメイン内であっても移行ロジックは一度きりの実行のためにコードを複雑化させます。

### 3. GM_storage の非同期性への対応
`GM_setValue` / `GM_getValue` は一部の環境やバージョン（`GM.setValue`）で非同期ですが、Tampermonkey の `GM_setValue` は同期的に動作します。
- **Decision**: 今回は同期的な `GM_setValue` / `GM_getValue` を前提とします。
- **Rationale**: 現在のアーキテクチャ（`Store` のコンストラクタでの初期化）が同期的であることを維持するためです。将来的に非同期ストレージへの完全移行が必要になった場合は、`Store` の初期化フロー全体を非同期化する別タスクとして検討します。

### 4. テスト環境のモック化
`src/test/mocks/gm_storage.ts` を作成し、`GM_setValue` 等をグローバルにスタブします。
- 現行の `LocalStorageMock` と同様のシンプルなインメモリ・オブジェクトとして実装します。

## Risks / Trade-offs

- **[Risk] 設定の初期化** → ユーザーがこれまで設定した内容が一度リセットされます。
  - **Mitigation**: プロポーザルおよび PR の説明で明示し、ユーザーに周知します。
- **[Risk] 容量制限の解消によるデータ増大** → `GM_storage` は容量が大きいですが、無限ではありません（Tampermonkey 自体の設定に依存）。
  - **Mitigation**: `ResumeManager` や `SearchCache` には引き続き適切な制限やクリーンアップ処理を維持します。
- **[Risk] @grant 変更による Sandbox 制約** → `@grant none` から特定の関数への変更により、UserScript が Sandbox 内で動作するようになり、`window` や `unsafeWindow` の挙動が変化する可能性があります。
  - **Mitigation**: 既存のロジックが `unsafeWindow` に依存していないか確認済みですが、実装後に動作確認を徹底します。
