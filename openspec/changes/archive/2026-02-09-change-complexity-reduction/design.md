## Context

現在のコードベースでは、`UIManager`、`InputManager`、`logic.ts` などの主要モジュールにおいて、関数の循環的複雑度（Cyclomatic Complexity）が非常に高くなっている（最大40）。これにより、以下の問題が発生している。
- 単体テストのカバレッジを上げることが困難（全分岐の網羅が指数関数的に難しいため）
- コードの可読性が低く、修正時のバグ混入リスクが高い

## Goals / Non-Goals

**Goals:**
- ESLint の `complexity` ルール（閾値: 10）を導入し、パスさせる
- 対象ファイルの複雑度を低減し、可読性とテスト容易性を向上させる
- 既存の機能を維持したままリファクタリングを行う（機能変更は行わない）

**Non-Goals:**
- UIの見た目や挙動の変更
- 新機能の追加

## Decisions

### 1. UIManager の分割戦略
`updateUI` メソッドは現在、すべてのコンポーネントの初期化と更新を一手に行っている。これを以下のプライベートメソッドに分割し、責務を分散させる。
- `_ensureRootContainer()`: コンテナ要素の確保
- `_initializeComponents()`: コンポーネントが未生成の場合の生成
- `_updateComponents(state)`: 各コンポーネントの `update` メソッド呼び出し
- `_handleModals(state)`: モーダルの表示切り替え管理
- `_applyGlobalStyles(state)`: グローバルなスタイル（スクロールバー非表示など）の適用

### 2. InputManager のコマンドパターン化
`onKeyDown` メソッド内の長い `if-else` チェーンを廃止し、ショートカットIDと実行関数をマッピングしたオブジェクト（コマンドマップ）を使用する。
- `const keyHandler: Record<string, () => void> = { ... }` を定義
- イベント発生時は、キー判定を行い、該当するハンドラを呼び出すだけの構造にする

### 3. logic.ts の純粋関数抽出
`fitImagesToViewport` は「ペアリング判定」と「DOM操作」が混在している。これを分離する。
- `calculatePairing(images, options)`: どの画像がペアになるか計算し、レイアウト情報（ViewModel的なもの）を返す純粋関数
- `applyLayout(layout, container)`: 計算結果に基づいてDOMを更新する関数

### 4. ui/utils.ts の分割
`createElement` の複雑度を下げるため、属性適用、イベントリスナー登録、スタイル適用をそれぞれ独立したヘルパー関数として切り出す。

## Risks / Trade-offs

- **Risk**: リファクタリングによる既存機能の破壊（デグレ）
  - **Mitigation**: 既存のユニットテストを活用し、変更前後で挙動が変わらないことを確認する。また、複雑なロジック（ペアリング判定など）は切り出した時点で新たなテストを追加し、堅牢性を高める。
