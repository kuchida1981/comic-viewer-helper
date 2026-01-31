## Context

現状の `src/main.js` は、ユーザースクリプトの全機能を一つのファイルで管理しており、DOM操作、状態管理、イベントリスナー、スタイリングが混然一体となっています。このため、コードの可読性が低く、特定の状態（例：`isDualViewEnabled`）が変更された際の波及効果を追跡することが困難です。

本設計では、これらの責務を明確に分離し、保守性と拡張性を向上させるためのアーキテクチャを導入します。

## Goals / Non-Goals

**Goals:**
- **関心の分離**: 状態管理 (`Store`)、UI構築 (`Components`)、オーケストレーション (`AppManager`) を分離する。
- **テスト可能性の向上**: 各モジュールを独立してテストできるようにする。特に `Store` と UI 生成関数。
- **スタイルの分離**: JS ロジックからインラインスタイルを排除し、CSS による宣言的なスタイル管理を行う。
- **カバレッジの維持**: 既存の `logic.js` のテストを維持しつつ、新設するロジックに対してもテストを追加する。

**Non-Goals:**
- **機能の追加**: 今回のリファクタリングではユーザー向けの新機能は追加しない。
- **既存ロジックの再実装**: `logic.js` に含まれる画像レイアウト計算ロジックなどは、インターフェースを維持したまま利用する。

## Decisions

### 1. Store クラスによる集中状態管理
状態を一元管理する `Store` クラスを導入します。
- **Rationale**: 複数の場所で `localStorage` を操作したり、グローバル変数を書き換えたりすることを防ぐため。
- **Design**:
  - `getState()` / `setState(patch)` による状態アクセス。
  - `setState` 時に自動的に `localStorage` への永続化を行う。
  - `subscribe(callback)` による変更通知（Observer パターン）により、UIの再描画などをトリガーする。

### 2. UI コンポーネントの分割と宣言的構築
`createNavigationUI` を以下の小さな関数またはコンポーネントに分割します。
- **Base**: `createElement(tag, options, children)` ユーティリティの導入。
- **Components**: `PowerButton`, `PageCounter`, `SpreadToggle`, `NavButtonGroup` など。
- **Rationale**: 巨大な HTML 構築ロジックを読みやすくし、再利用性を高めるため。

### 3. スタイリングの外部化
JS 内の `Object.assign(el.style, ...)` を廃止し、`<style>` タグを一括注入します。
- **Rationale**: 見た目とロジックを分離し、CSS の柔軟性（ホバー効果、レスポンシブ対応など）を活かすため。
- **Implementation**: `header.js` または `main.js` の初期化時に CSS 文字列を `document.head` に追加する。

### 4. ドラッグ機能の独立化 (`Draggable`)
GUI コンテナを移動可能にするロジックを `Draggable` クラスとして抽出します。
- **Rationale**: ドラッグ処理は UI 構築そのものとは異なる責務であり、他の要素にも適用可能な汎用的なロジックであるため。

## Risks / Trade-offs

- **[Risk] リファクタリングによるバグ混入** → **[Mitigation]** 既存の `logic.test.js` を常に実行し、新設する `Store` にもテストを書く。また、JSDOM を用いた UI の基本動作テストを導入する。
- **[Trade-off] ファイル数が増えることによる管理コスト** → **[Mitigation]** ユーザースクリプトとしてビルド（Vite）しているため、開発時の分割は最終的な配布ファイルサイズには大きく影響しない。むしろ保守性の向上が勝る。
- **[Risk] 状態更新時の頻繁な UI 再描画** → **[Mitigation]** `Store.subscribe` を通じて、必要なコンポーネントのみを更新するか、描画を `requestAnimationFrame` でバッチ化することを検討する。
