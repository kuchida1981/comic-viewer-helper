## ADDED Requirements

### Requirement: 非公開作品へのフラグ付与
アダプターは、メタデータ抽出時の `relatedWorks` に対し、タイトルの先頭が「非公開」であるかを判定し、該当する作品に `isPrivate: true` を付与しなければならない (SHALL)。

#### Scenario: 非公開作品のフラグ付与
- **WHEN** アダプターが関連作品リストを抽出し、ある作品のタイトルが「非公開」で始まる
- **THEN** その作品オブジェクトに `isPrivate: true` が付与される

#### Scenario: 公開作品のフラグ付与
- **WHEN** アダプターが関連作品リストを抽出し、あるタイトルが「非公開」で始まらない
- **THEN** その作品オブジェクトに `isPrivate: false` が付与される
