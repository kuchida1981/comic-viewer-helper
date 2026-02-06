## ADDED Requirements

### Requirement: DOM要素の存在確認
DOMから要素を取得したり、引数として要素を受け取る関数は、操作を行う前に要素が null または undefined でないことを確認しなければならない（SHALL）。

#### Scenario: 要素が null の場合に早期リターンする
- **WHEN** 関数に null の要素が渡される
- **THEN** ランタイムエラーを発生させず、安全に処理を中断またはデフォルト値を返却する

### Requirement: メソッドおよびプロパティの存在確認
DOM要素のメソッド（`getBoundingClientRect` 等）やプロパティ（`naturalWidth` 等）にアクセスする場合、それらが存在することを事前に確認しなければならない（SHALL）。特に `any` キャストや不完全なモックオブジェクトが渡された場合でもエラーにならないようにする。

#### Scenario: getBoundingClientRect が未定義の場合の保護
- **WHEN** `getBoundingClientRect` メソッドを持たないオブジェクトが画像要素として関数に渡される
- **THEN** 適切にフォールバック処理（例：サイズ 0 として扱う）が行われ、例外が発生しない

#### Scenario: addEventListener 等の存在確認
- **WHEN** 古いブラウザ環境や特殊なモックなど、標準的なメソッドが欠損している要素が操作対象となる
- **THEN** メソッドの存在チェックを行い、存在する場合のみ呼び出す
