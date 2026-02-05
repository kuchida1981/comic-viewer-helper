# ui-architecture Specification

## Purpose
TBD - created by archiving change refactor-main-js. Update Purpose after archive.
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

