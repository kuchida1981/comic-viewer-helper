# gm-storage-integration Specification

## Purpose
UserScript 専用の隔離された永続ストレージ（`GM_setValue` / `GM_getValue`）を TypeScript から安全に利用するための基盤機能を提供します。これにより、サイト側のストレージ制限や干渉を受けない安定したデータ保存を実現します。

## ADDED Requirements

### Requirement: GM_storage API の抽象化と型定義
システムは、`GM_setValue`, `GM_getValue`, `GM_deleteValue` を TypeScript から型安全に利用できるように定義しなければならない (MUST)。

#### Scenario: 型安全な値の保存
- **WHEN** `GM_setValue(key, value)` を呼び出すとき
- **THEN** 引数が正しい型（string, number, boolean, またはシリアライズ可能なオブジェクト）であることをコンパイラがチェックできる

#### Scenario: 型安全な値の取得
- **WHEN** `GM_getValue(key, defaultValue)` を呼び出すとき
- **THEN** 戻り値の型が `defaultValue` の型と一致することをコンパイラが保証できる

### Requirement: テスト環境での GM_storage モック提供
システムは、ブラウザ（UserScript マネージャ）が存在しないユニットテスト環境において、`GM_` 関数の挙動をシミュレートするモックを提供しなければならない (MUST)。

#### Scenario: テストでのデータ永続化のシミュレーション
- **WHEN** テストコード内で `GM_setValue` を呼び出した後、`GM_getValue` を呼び出すとき
- **THEN** モック内のインメモリ・ストレージから保存された値が正しく取得できる
