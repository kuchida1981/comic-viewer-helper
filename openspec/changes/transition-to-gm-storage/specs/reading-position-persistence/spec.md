# reading-position-persistence delta Specification

## MODIFIED Requirements

### Requirement: 現在の読書位置を保存できる
システムは、ユーザーがページから離脱する際に、現在閲覧中のページインデックスを UserScript 専用ストレージに保存しなければならない（SHALL）。

#### Scenario: ページ離脱時に位置を保存
- **WHEN** ユーザーが47ページ目を閲覧中にページから離脱した
- **THEN** システムは `GM_setValue` を用いて { "url": { pageIndex: 46 } } を保存する（0-based index）

#### Scenario: 既存の保存データに追加する
- **WHEN** ストレージに既に他の作品データが存在し、ユーザーが新しい作品から離脱した
- **THEN** システムは既存データを保持したまま新しいエントリを追加する

#### Scenario: 同じ作品の位置を上書き更新する
- **WHEN** ストレージに既にその作品のデータが存在し、ユーザーが再度その作品から離脱した
- **THEN** システムは古い位置を新しい位置で上書きする

### Requirement: 保存された読書位置を読み込める
システムは、作品URLをキーとして、保存された読書位置を UserScript 専用ストレージから読み込めなければならない（SHALL）。読み込まれたデータは型ガードによって構造が検証され、期待される形式（`ResumeData`）でない場合は安全に破棄されなければならない（SHALL）。

#### Scenario: 保存データが存在する場合の読み込み
- **WHEN** ストレージに { "https://example.com/post/123456": { pageIndex: 46 } } が保存されている
- **THEN** システムはそのURLに対して pageIndex 46 を返す

#### Scenario: 保存データが存在しない場合
- **WHEN** ストレージにそのURLのデータが存在しない
- **THEN** システムは null を返す

#### Scenario: ストレージが破損している場合
- **WHEN** ストレージのデータが不正なJSON形式である、またはデータ構造が `ResumeData` の要件を満たさない
- **THEN** システムはエラーを catch または型ガードで検出し、空のオブジェクトとして扱う

### Requirement: ストレージへの保存形式を定義する
システムは、複数の作品の読書位置を単一のキーで管理しなければならない（SHALL）。

#### Scenario: データ構造の検証
- **WHEN** システムがデータを保存する
- **THEN** キー 'comic-viewer-helper-resume-data' にシリアライズされたデータとして保存される

#### Scenario: 複数作品のデータ構造
- **WHEN** 複数の作品の位置が保存されている
- **THEN** データは { "url1": { pageIndex: N }, "url2": { pageIndex: M } } 形式である

### Requirement: データの削除機能を提供する
システムは、すべての保存された読書位置を削除する機能を提供しなければならない（SHALL）。

#### Scenario: すべてのデータを削除
- **WHEN** clearAll() が呼ばれた
- **THEN** ストレージから 'comic-viewer-helper-resume-data' が削除される

#### Scenario: 削除後の読み込み
- **WHEN** clearAll() 実行後に読み込みを試行した
- **THEN** システムは null を返す
