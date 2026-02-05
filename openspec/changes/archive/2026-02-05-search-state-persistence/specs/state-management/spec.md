## MODIFIED Requirements

### Requirement: 状態の一元管理と永続化
Store はアプリケーションのすべての重要な状態を保持し、変更が加えられた際には自動的に `localStorage` へ永続化し、登録されたリスナーへ通知しなければならない (MUST)。状態の定義には TypeScript のインターフェースを用い、型安全なアクセスを保証する。

#### Scenario: 検索状態の永続化
- **WHEN** 検索キーワードまたは検索キャッシュが更新された時
- **THEN** それらのデータが `localStorage` に保存されること
