## MODIFIED Requirements

### Requirement: 保存された読書位置を読み込める
システムは、作品URLをキーとして、保存された読書位置を localStorage から読み込めなければならない（SHALL）。読み込まれたデータは型ガードによって構造が検証され、期待される形式（`ResumeData`）でない場合は安全に破棄されなければならない（SHALL）。

#### Scenario: 保存データが存在する場合の読み込み
- **WHEN** localStorage に { "https://example.com/post/123456": { pageIndex: 46 } } が保存されている
- **THEN** システムはそのURLに対して pageIndex 46 を返す

#### Scenario: 保存データが存在しない場合
- **WHEN** localStorage にそのURLのデータが存在しない
- **THEN** システムは null を返す

#### Scenario: localStorage が破損している場合
- **WHEN** localStorage のデータが不正なJSON形式である、またはデータ構造が `ResumeData` の要件を満たさない
- **THEN** システムはエラーを catch または型ガードで検出し、空のオブジェクトとして扱う
