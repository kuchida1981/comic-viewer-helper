## ADDED Requirements

### Requirement: 状態の一元管理と永続化
Store はアプリケーションのすべての重要な状態を保持し、変更が加えられた際には自動的に `localStorage` へ永続化し、登録されたリスナーへ通知しなければならない (MUST)。

#### Scenario: 状態の更新と通知
- **WHEN**: `Store.setState({ enabled: false })` が呼び出された時
- **THEN**: `localStorage` の該当キーが更新され、すべての登録済みリスナーが最新の状態を受け取って実行される

### Requirement: 初期状態のロード
Store は初期化時に `localStorage` から保存された状態を読み込み、存在しない場合はデフォルト値を適用しなければならない (MUST)。

#### Scenario: 既存設定の復元
- **WHEN**: Store がインスタンス化された時
- **THEN**: `localStorage` に保存されているユーザー設定（enabled, dualView, guiPosなど）が初期状態として反映される
