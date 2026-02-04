## MODIFIED Requirements

### Requirement: 状態の一元管理と永続化
Store はアプリケーションのすべての重要な状態を保持し、変更が加えられた際には自動的に `localStorage` へ永続化し、登録されたリスナーへ通知しなければならない (MUST)。状態の定義には TypeScript のインターフェースを用い、型安全なアクセスを保証する。

#### Scenario: 型安全な状態更新
- **WHEN** `Store.setState` を呼び出すとき
- **THEN** 渡されたオブジェクトのキーと値が `StoreState` 型と一致しているかコンパイル時に検証される
