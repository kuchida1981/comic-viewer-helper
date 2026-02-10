## MODIFIED Requirements

### Requirement: 初期状態のロード
Store は初期化時に `localStorage` から保存された状態を読み込み、存在しない場合やデータ構造が不正な場合はデフォルト値を適用しなければならない (MUST)。読み込まれたデータは必ず型ガードによって構造の妥当性が検証されなければならない (MUST)。

#### Scenario: 既存設定の復元
- **WHEN**: Store がインスタンス化された時
- **THEN**: `localStorage` に保存されているユーザー設定（enabled, dualView, guiPos, **searchHistory** など）が初期状態として反映される

#### Scenario: 不正な形式のデータ読み込み
- **WHEN** `localStorage` に `StoreState` の一部として不適切なデータ（例：`guiPos` が数値ではない等）が保存されている状態で Store が初期化されたとき
- **THEN** 型ガードによる検証が失敗し、該当する項目にはデフォルト値が適用される
