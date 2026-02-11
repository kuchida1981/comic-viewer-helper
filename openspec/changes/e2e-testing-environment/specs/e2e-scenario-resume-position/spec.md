## ADDED Requirements

### Requirement: Reading Position Persistence
ユーザーはページをリロードした際に、前回読んでいた位置から再開できる必要があります（SHALL）。

#### Scenario: Resume notification and jumping
- **WHEN** 数ページスクロールした状態でページをリロードする
- **THEN** 「前回の続きから読みますか？」という通知が表示され、「はい」を押すと元の位置へスクロールされる
