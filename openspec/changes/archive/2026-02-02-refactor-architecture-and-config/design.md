## Context

現状の `App` クラスは、DOMイベントの監視、ナビゲーション、UI管理、およびサイト固有のセレクタ参照（`#post-comic`）をすべて単一のクラスで行っています。これは「関心の分離」に反しており、将来的に異なるDOM構造を持つサイトに対応する際の障害となります。本設計では、これらの責務を分割し、サイトごとの差異を「サイトアダプター」として抽出することで、拡張性と保守性を向上させます。

## Goals / Non-Goals

**Goals:**
- **サイトアダプターの導入**: サイト固有の情報を `SiteAdapter` としてカプセル化する。
- **Appクラスの分解**: 役割ごとに `InputManager`, `Navigator`, `UIManager` に機能を分散させる。
- **依存性の注入 (DI)**: アダプターを各マネージャーに注入し、特定のサイト構造に依存しないロジックを実現する。
- **テスト可能性の向上**: 各マネージャーを独立してテストできるようにする。

**Non-Goals:**
- **既存ロジックの再実装**: `logic.js` のレイアウト計算アルゴリズムは変更しない。
- **新機能の追加**: 本リファクタリングに付随しない新機能は追加しない。

## Decisions

### 1. サイトアダプター (SiteAdapter) インターフェース
サイトごとの定義を以下の構造を持つオブジェクト（アダプター）として抽出します。

```javascript
/**
 * @typedef {Object} SiteAdapter
 * @property {function(string): boolean} match - URLが適合するか
 * @property {function(): HTMLElement | null} getContainer - コンテナ要素の取得
 * @property {function(): HTMLImageElement[]} getImages - 画像要素リストの取得
 * @property {function(): Metadata} [getMetadata] - メタデータの取得
 */
```

### 2. マネージャークラスの構成
`App` クラスを以下のマネージャーに分解します。

- **InputManager**: `keydown`, `wheel`, `resize`, `scroll` 等のイベントリスナーを管理。
- **Navigator**: ページジャンプ、スクロール、レイアウト適用 (`fitImagesToViewport` の呼び出し) を担当。
- **UIManager**: GUIコンポーネントの生成、更新、表示制御を担当。

### 3. アダプターの選択と注入
`App` の初期化時に、登録されたアダプターの中から現在のURLに適合するものを選択し、各マネージャーのコンストラクタに渡します。

```javascript
// Appクラス内
const adapter = adapters.find(a => a.match(window.location.href)) || DefaultAdapter;
this.navigator = new Navigator(adapter, this.store);
this.uiManager = new UIManager(adapter, this.store);
this.inputManager = new InputManager(this.navigator, this.uiManager);
```

### 4. ディレクトリ構造の整理
`src/` 配下に `adapters/` および `managers/` ディレクトリを作成し、ファイルを整理します。

## Risks / Trade-offs

- **[Risk] 既存サイトでの動作不備** → **[Mitigation]** 現在の動作を `DefaultAdapter` に封じ込め、リファクタリング前後の挙動を結合テストおよび手動確認で徹底的に検証する。
- **[Trade-off] ファイル数の増加** → **[Mitigation]** 開発時の見通しを優先。Viteによるビルド後のサイズ増加は無視できる範囲。
