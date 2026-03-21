# state-management Delta Specification

## MODIFIED Requirements

### Requirement: 状態の一元管理と永続化
Store はアプリケーションのすべての重要な状態を保持し、変更が加えられた際には自動的に `GM_setValue` へ永続化し、登録されたリスナーへ通知しなければならない (MUST)。
また、同期設定が有効な場合には、永続化された変更を同期エンジン（SyncManager）へ通知し、外部ストレージへの反映をトリガーしなければならない (MUST)。
状態の定義には TypeScript のインターフェースを用い、型安全なアクセスを保証する。

#### Scenario: 型安全な状態更新
- **WHEN** `Store.setState` を呼び出すとき
- **THEN** 渡されたオブジェクトのキーと値が `StoreState` 型と一致しているかコンパイル時に検証される

#### Scenario: 検索状態の永続化と同期通知
- **WHEN** 検索キーワード、検索キャッシュ、または**検索履歴**が更新された時
- **THEN** それらのデータが `GM_setValue` を用いて保存されること
- **AND** 同期設定が有効な場合、外部への同期処理がスケジュールされること
