# Spec: Reading Position Persistence

読書位置の永続化機能の仕様

## ADDED Requirements

### Requirement: 作品URLから一意なキーを生成できる
システムは、現在閲覧中の作品を一意に識別するため、URLから決定的なキーを生成しなければならない。

#### Scenario: 標準的なURLからキー生成
- **WHEN** ユーザーが "https://example.com/post/123456" を閲覧している
- **THEN** システムは "https://example.com/post/123456" をキーとして生成する

#### Scenario: クエリパラメータを含むURLからキー生成
- **WHEN** ユーザーが "https://example.com/post/123456?page=2&ref=search" を閲覧している
- **THEN** システムは "https://example.com/post/123456" をキーとして生成する（クエリパラメータは除外）

#### Scenario: 異なる作品は異なるキーを持つ
- **WHEN** ユーザーが "/post/123456" と "/post/789012" を閲覧した
- **THEN** システムは2つの異なるキーを生成する

### Requirement: 現在の読書位置を保存できる
システムは、ユーザーがページから離脱する際に、現在閲覧中のページインデックスをlocalStorageに保存しなければならない。

#### Scenario: ページ離脱時に位置を保存
- **WHEN** ユーザーが47ページ目を閲覧中にページから離脱した
- **THEN** システムは localStorage に `{ "url": { pageIndex: 46 } }` を保存する（0-based index）

#### Scenario: 機能が無効の場合は保存しない
- **WHEN** resumeEnabled が false の状態でユーザーがページから離脱した
- **THEN** システムは localStorage への保存を行わない

#### Scenario: 既存の保存データに追加する
- **WHEN** localStorage に既に他の作品データが存在し、ユーザーが新しい作品から離脱した
- **THEN** システムは既存データを保持したまま新しいエントリを追加する

#### Scenario: 同じ作品の位置を上書き更新する
- **WHEN** localStorage に既にその作品のデータが存在し、ユーザーが再度その作品から離脱した
- **THEN** システムは古い位置を新しい位置で上書きする

### Requirement: 保存された読書位置を読み込める
システムは、作品URLをキーとして、保存された読書位置を localStorage から読み込めなければならない。

#### Scenario: 保存データが存在する場合の読み込み
- **WHEN** localStorage に `{ "https://example.com/post/123456": { pageIndex: 46 } }` が保存されている
- **THEN** システムはそのURLに対して pageIndex 46 を返す

#### Scenario: 保存データが存在しない場合
- **WHEN** localStorage にそのURLのデータが存在しない
- **THEN** システムは null を返す

#### Scenario: 機能が無効の場合は読み込まない
- **WHEN** resumeEnabled が false の状態で読み込みを試行した
- **THEN** システムは null を返す

#### Scenario: localStorage が破損している場合
- **WHEN** localStorage のデータが不正なJSON形式である
- **THEN** システムはエラーを catch し、空のオブジェクトとして扱う

### Requirement: localStorageへの保存形式を定義する
システムは、複数の作品の読書位置を単一のキーで管理しなければならない。

#### Scenario: データ構造の検証
- **WHEN** システムが localStorage にデータを保存する
- **THEN** キー 'comic-viewer-helper-resume-data' にJSON文字列として保存される

#### Scenario: 複数作品のデータ構造
- **WHEN** 複数の作品の位置が保存されている
- **THEN** データは `{ "url1": { pageIndex: N }, "url2": { pageIndex: M } }` 形式である

### Requirement: データの削除機能を提供する
システムは、すべての保存された読書位置を削除する機能を提供しなければならない。

#### Scenario: すべてのデータを削除
- **WHEN** clearAll() が呼ばれた
- **THEN** localStorage から 'comic-viewer-helper-resume-data' が削除される

#### Scenario: 削除後の読み込み
- **WHEN** clearAll() 実行後に読み込みを試行した
- **THEN** システムは null を返す
