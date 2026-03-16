## MODIFIED Requirements

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
