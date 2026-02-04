## Context

コミックビューアは、キーボード入力を `shortcuts.js`（定義層）→ `InputManager.js`（判定・実行層）のパターンで管理している。新規キーバインドの追加は、この2つのファイルに変更を加え、`i18n.js` に多言語キーを追加するだけで完結する。ヘルプモーダルは `SHORTCUTS` 配列から自動生成されるため、別途の変更は不要。

フルスクリーン切り替えは標準の Fullscreen API (`document.documentElement.requestFullscreen()` / `document.exitFullscreen()`) で実現する。

## Goals / Non-Goals

**Goals:**
- `f` キー押下で `document.documentElement` のフルスクリーン入場・退場をトグルする
- フルスクリーン状態の判定は `document.fullscreenElement` で行う
- ヘルプモーダルのショートカット一覧に自動で表示される
- 英・日の両言語でラベル・説明文を提供する

**Non-Goals:**
- ブラウザポップアップブロッカーによる失敗時の通知UI（Fullscreen API の制約で、ユーザーgest 外での呼び出しは本質的にブロックされるため、失敗は静的に無視するだけで十分）
- Firefox や古いEdgeの接頭辞付きAPI（`mozRequestFullScreen` 等）への後方互換対応（現時点で主流ブラウザすべてが標準APIに対応済み）
- モーダル開時のフルスクリーン操作の制御（既存パターンと同様に、モーダル開時は一般キー操作を無視する）

## Decisions

### 1. フルスクリーン対象は `document.documentElement`

**選択肢A: `document.documentElement`（ページ全体）**
**選択肢B: 特定のコンテナ要素**

→ **A を採用。** コミックビューアはサイト全体のコンテンツを表示対象としており、特定コンテナのみでは漏れが発生する可能性がある。ページ全体のフルスクリーンが読書体験として最も自然。

### 2. フルスクリーン実行関数の配置

**選択肢A: `InputManager.js` に直接 Fullscreen API 呼び出しを書く**
**選択肢B: 別モジュールに抽象化する**

→ **A を採用。** Fullscreen API の呼び出しは2行程度で、他のキー処理（`dualView`, `metadata` など）も同様に `InputManager.js` 内で直接実行している。抽象化のメリットは小さく、既存パターンとの一貫性を優先。


### 3. モーダル開時の動作

既存のキー処理では、モーダルが開いている場合は一般キー操作を無視する（`InputManager.js:129`）。`f` キーも同じ制約のもとに置く。特別なハンドリングは不要。

## Risks / Trade-offs

- **[Fullscreen API の非対応ブラウザ]** → `document.documentElement.requestFullscreen` の存在確認で事前チェックを行い、非対応の場合は静的に無視する（エラーは発生しない）。
- **[ブラウザのセキュリティポリシー]** → Fullscreen API は「ユーザーのジェスチャー」から呼び出される必要がある。`keydown` イベントはユーザージェスチャーとして認識されるため、この制約は問題にならない。
- **[Escape キーによるフルスクリーン退場]** → ブラウザ自体が `Escape` でフルスクリーン退場を処理するため、アプリ側で別途対応する必要がない。