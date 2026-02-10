# ui-architecture Specification

## Purpose
UI の構造、コンポーネントの責務、および DOM 操作の安全性に関する設計指針を定義します。

## Requirements
### Requirement: コンポーネントベースの UI 構築
UI は、独立した小さな部品（コンポーネント）から構成され、共通の要素生成ユーティリティ（`createElement` など）を使用して宣言的に構築されなければならない (MUST)。また、各コンポーネントおよびユーティリティは TypeScript で記述され、適切な型定義を持つものとする。

#### Scenario: 型安全な要素生成
- **WHEN** `createElement` を呼び出して要素を生成するとき
- **THEN** 引数に渡すオプションや子要素が、TypeScript のインターフェースによって型チェックされる

#### Scenario: モーダルコンポーネントの追加
- **WHEN** 検索モーダルなどの新しいUI部品を追加する時
- **THEN** 既存のモーダル実装（MetadataModal等）と一貫したライフサイクルおよびスタイリングを持つコンポーネントとして実装されること

### Requirement: CSS クラスによるスタイリング
UI のスタイリングは、JS 内のインラインスタイルではなく、外部または一括注入された CSS クラスによって定義されなければならない (MUST)。

#### Scenario: スタイルの適用
- **WHEN**: UI コンポーネントが生成される時
- **THEN**: 定義された CSS クラス（例: `comic-helper-button`）が要素に付与され、意図した見た目が適用される

### Requirement: ドラッグ可能な GUI コンテナ
GUI コンテナは、ユーザーがマウス操作で任意の位置に移動でき、その位置が保存されなければならない (MUST)。また、移動時およびリサイズ時にコンテナがビューポート外に逸脱しないよう制限されなければならない (SHALL)。

#### Scenario: コンテナのドラッグ移動
- **WHEN**: ユーザーがコンテナのドラッグハンドル（または背景）を掴んで移動させた時
- **THEN**: コンテナの座標が更新され、移動終了時に `Store` を通じて位置情報が保存される

#### Scenario: ビューポート内への自動制限（リサイズ時）
- **WHEN**: ウィンドウサイズが変更され、現在の GUI 位置が画面外になる時
- **THEN**: GUI コンテナは自動的に現在のビューポート内に引き戻され、完全に見失うことがないようにすること

### Requirement: 標準スクロールバーの非表示化
システムは、スクリプトが有効な間、ブラウザ標準の垂直スクロールバーを非表示にし、表示領域を最大化しなければならない (SHALL)。

#### Scenario: スクロールバーの非表示
- **WHEN** スクリプトが有効化（enabled: true）される
- **THEN** `html` 要素に特定のクラスが付与され、CSS によって `overflow: hidden` が適用される

#### Scenario: スクロールバーの復元
- **WHEN** スクリプトが無効化（enabled: false）される
- **THEN** `html` 要素からクラスが除去され、標準のスクロール挙動と表示が復元される

### Requirement: Efficient DOM Reconciliation
The system SHALL update the DOM by comparing the desired state with the current state and applying only necessary changes (ADD/REMOVE/MOVE/UPDATE), avoiding full re-creation of the component tree whenever possible. This is to ensure rendering performance and visual stability.

#### Scenario: Updating layout mode
- **WHEN** switching between Single and Dual page modes
- **THEN** existing image elements are preserved and moved into/out of wrappers instead of being destroyed and recreated.

#### Scenario: Window resize
- **WHEN** the browser window is resized
- **THEN** the layout is updated to fit the new viewport without destroying DOM elements that remain visible.

### Requirement: コンポーネント更新の自律化
UIマネージャー（`UIManager`）の複雑度を低減するため、各UIコンポーネントは自身の状態更新ロジックをカプセル化し、`update(state)` メソッドなどを通じて自律的に再描画を行わなければならない（MUST）。マネージャー側での詳細な条件分岐（存在チェックや内部状態の比較）は避けるべきである。

#### Scenario: 状態変更時のUI更新
- **WHEN** ストアの状態が変更され、`UIManager` が通知を受け取る
- **THEN** `UIManager` は各コンポーネントの更新メソッドを呼び出し、コンポーネント自身が必要なDOM操作を判断して実行する

### Requirement: ロジックの隠蔽と安全なアクセス
UIManager は、内部的な DOM 操作やイベントハンドラなどの補助的なメソッドをプライベート化し、外部からの不正なアクセスを防がなければならない（SHALL）。また、すべてのメソッド（プライベートを含む）は、`this` の文脈を常に保持するため、アロー関数プロパティとして定義されなければならない（SHALL）。

#### Scenario: 内部メソッドへのアクセス制限
- **WHEN** UIManager インスタンスに対して外部から `_` で始まるメソッドを呼び出そうとする
- **THEN** TypeScript のコンパイルエラーが発生すること

#### Scenario: メソッドの this 束縛の安全性
- **WHEN** UIManager のメソッドを他のコンポーネントのコールバックとして渡す
- **THEN** 呼び出し時に `this` が常に UIManager インスタンスを指していることが保証される（`bind` やラップなしでも正常に動作する）
