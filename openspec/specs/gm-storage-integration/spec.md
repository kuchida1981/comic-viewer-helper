# gm-storage-integration Specification

## Purpose
UserScript 専用の隔離された永続ストレージ（`GM_setValue` / `GM_getValue`）を TypeScript から安全に利用するための基盤機能を提供します。これにより、サイト側のストレージ制限や干渉を受けない安定したデータ保存を実現します。

## Requirements

### Requirement: GM_storage API の抽象化と型定義
システムは、`GM_setValue`, `GM_getValue`, `GM_deleteValue` を TypeScript から型安全に利用できるように定義しなければならない (MUST)。新しく追加される `pinnedTags` も、既存の永続化の仕組み（`GM_storage`）を利用して保存されなければならない（SHALL）。

#### Scenario: 型安全な値の保存
- **WHEN** `GM_setValue(key, value)` を呼び出すとき
- **THEN** `value` が `string` 型であることをコンパイラがチェックできる
- **NOTE** 複合型（オブジェクト・配列）は呼び出し側で `JSON.stringify` によって文字列化してから渡す

#### Scenario: 型安全な値の取得
- **WHEN** `GM_getValue(key, defaultValue)` を呼び出すとき
- **THEN** 戻り値の型が `string | undefined` であることをコンパイラが保証できる
- **NOTE** 複合型を復元する場合は呼び出し側で `JSON.parse` を使用し、型ガードで検証する

#### Scenario: ピン留めされたタグの状態を永続化する
- **WHEN** ユーザーがタグをピン留めまたは解除し、`Store` が更新されるとき
- **THEN** `GM_setValue` が呼び出され、`pinnedTags` のリストが `GM_storage` に保存される

### Requirement: テスト環境での GM_storage モック提供
システムは、ブラウザ（UserScript マネージャ）が存在しないユニットテスト環境において、`GM_` 関数の挙動をシミュレートするモックを提供しなければならない (MUST)。

#### Scenario: テストでのデータ永続化のシミュレーション
- **WHEN** テストコード内で `GM_setValue` を呼び出した後、`GM_getValue` を呼び出すとき
- **THEN** モック内のインメモリ・ストレージから保存された値が正しく取得できる
