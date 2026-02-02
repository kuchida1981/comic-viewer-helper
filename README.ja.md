# Magazine Comic Viewer Helper

[![Build Status](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/kuchida1981/comic-viewer-helper/actions/workflows/deploy.yml)

特定の漫画閲覧サイト向けのTampermonkey/Greasemonkey用ユーザースクリプトです。
画像をブラウザのビューポートサイズに合わせて自動調整し、画像単位での快適なスクロール移動を可能にします。

## 主な機能
... (省略) ...

## インストール方法

1.  ブラウザに [Tampermonkey](https://www.tampermonkey.net/) などのユーザースクリプトマネージャー拡張機能をインストールします。
2.  以下のいずれかのリンクを開いて、スクリプトをインストールします：
    - **[安定版 (推奨)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/stable/comic-viewer-helper.user.js)**
    - **[開発版 (最新)](https://raw.githubusercontent.com/kuchida1981/comic-viewer-helper/unstable/comic-viewer-helper.user.js)**
3.  対応するサイトにアクセスすると自動的に有効になります。

## 使い方

スクリプトが有効なページでは、以下の操作が可能です。

### キーボードショートカット

| 動作 | キー |
| :--- | :--- |
| **次の画像へ** | `↓` `→` `PageDown` `Space` `j` |
| **前の画像へ** | `↑` `←` `PageUp` `Shift + Space` `k` |

### 画面UI

画面右下に表示されるパネルから以下の操作ができます。**パネルはドラッグ可能**で、マウスで好きな位置に移動できます。

*   **ページカウンター**: 現在の画像位置 / 総画像数を表示
*   **見開き切替 (Spread)**: 単ページ表示と見開き表示を切り替えます（`d` キーでも切り替え可能）
*   **<<**: 最初の画像へ移動
*   **<**: 前の画像へ移動
*   **>**: 次の画像へ移動
*   **>>**: 最後の画像へ移動

## 動作対象サイト

*   `https://something/magazine/*`
*   `https://something/fanzine/*`

※ スクリプト内の `@match` 設定で対象ドメインは変更可能です。

## 技術仕様

*   対象コンテナセレクタ: `#post-comic`
*   対象画像セレクタ: `#post-comic img`

## 開発者向け情報

### ⚠️ 注意: ビルド済みファイルを直接編集しないでください
`dist/comic-viewer-helper.user.js` は**ビルド成果物**です。手動で編集しても、次のビルド時に上書きされます。
コードの修正は `src/` ディレクトリ内のファイルに対して行い、ビルドコマンドを実行してください。

### 準備
1. 依存関係のインストール:
   ```bash
   npm install
   ```

### ビルド
ソースコードから `dist/comic-viewer-helper.user.js` を生成します：
```bash
npm run build
```
※ `dist/` ディレクトリは Git の管理から除外されています。ビルド成果物は、masterブランチへのプッシュ時に `unstable` ブランチへ、またバージョンタグのプッシュ時に `stable` ブランチへ GitHub Actions によって自動的にデプロイされます。

### テスト
Vitest を使用してユニットテストを実行します（カバレッジレポートも生成されます）：
```bash
npm test
```
コアロジック (`src/logic.js`) は **カバレッジ 100%** を維持しています。

### 型チェック
JSDoc と TypeScript を使用した静的型解析を実行します：
```bash
npm run check-types
```

### リンティング
ESLint を使用してコードスタイルと UserScript メタデータの検証を実行します：
```bash
npm run lint
```

## 免責事項

このスクリプトは個人的な学習および利便性向上のために作成されたものです。
対象サイトの仕様変更により動作しなくなる可能性があります。

## ライセンス

このプロジェクトは ISC ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご覧ください。
