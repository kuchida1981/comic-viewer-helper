# state-management Specification

## Purpose
アプリケーション全体の状態を一元管理し、永続化が必要な設定を同期・復元することで、一貫したユーザー体験を提供します。

## Requirements
### Requirement: 状態の一元管理と永続化
Store はアプリケーションのすべての重要な状態を保持し、変更が加えられた際には自動的に `localStorage` へ永続化し、登録されたリスナーへ通知しなければならない (MUST)。状態の定義には TypeScript のインターフェースを用い、型安全なアクセスを保証する。

#### Scenario: 型安全な状態更新
- **WHEN** `Store.setState` を呼び出すとき
- **THEN** 渡されたオブジェクトのキーと値が `StoreState` 型と一致しているかコンパイル時に検証される

#### Scenario: 検索状態の永続化
- **WHEN** 検索キーワードまたは検索キャッシュが更新された時
- **THEN** それらのデータが `localStorage` に保存されること

### Requirement: 初期状態のロード
Store は初期化時に `localStorage` から保存された状態を読み込み、存在しない場合はデフォルト値を適用しなければならない (MUST)。

#### Scenario: 既存設定の復元
- **WHEN**: Store がインスタンス化された時
- **THEN**: `localStorage` に保存されているユーザー設定（enabled, dualView, guiPosなど）が初期状態として反映される

### Requirement: 一時的なUI状態の管理
Store は永続化の必要がない一時的なUI状態（ローディング中など）も管理できるものとし、これらは `localStorage` への保存対象から除外されなければならない（SHALL）。

#### Scenario: ローディング状態の更新
- **WHEN** 画像読み込み待ちが発生し、`Store.setState({ isLoading: true })` が呼び出されたとき
- **THEN** 購読しているコンポーネントには通知されるが、`localStorage` には保存されない
- **AND** ページリロード後、この状態は初期値（false）に戻る

