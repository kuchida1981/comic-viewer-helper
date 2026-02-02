# Magazine Comic Viewer Helper (Description)

## 日本語 (Japanese)

特定の漫画閲覧サイトでの閲覧体験を向上させるユーザースクリプトです。
画像をブラウザのビューポートに合わせて自動調整し、画像単位での快適なスクロール移動を可能にします。

### 🚀 主な機能
- **自動サイズ調整**: 画像を画面サイズに合わせて最適化し、スクロールの手間を軽減します。
- **画像単位ナビゲーション**: キーボードやUIボタンで、画像から画像へ正確に移動できます。
- **見開き表示モード**: 単ページ表示と見開き（2ページ）表示を切り替え可能です。
- **ドラッグ可能なUI**: 画面右下の操作パネルは自由な位置に配置できます。
- **メタデータ・タグ表示**: 閲覧中の作品の情報を素早く確認できます。

### 🛠 使い方
1. [Tampermonkey](https://www.tampermonkey.net/) などのユーザースクリプトマネージャーをインストールします。
2. 本スクリプトをインストールします。
3. **スクリプト冒頭の `@match` にある `something` は `example.com` など適宜変更して使ってください。**
4. スクリプトのメタデータ（`@name:ja` や `@license` など）が正しく設定されていることを確認してください。
5. 対象サイトにアクセスすると自動的にパネルが表示されます。

### ⌨️ キーボードショートカット
| 動作 | キー |
| :--- | :--- |
| **次の画像へ** | `↓` `→` `PageDown` `Space` `j` |
| **前の画像へ** | `↑` `←` `PageUp` `Shift + Space` `k` |
| **見開き切替** | `d` |
| **情報表示** | `i` |

---

## English (English)

Enhances the reading experience on specific comic sites by fitting images to the viewport and enabling precise image-by-image navigation.

### 🚀 Key Features
- **Auto-Fitting**: Automatically optimizes image size to fit your browser window.
- **Image-by-Image Navigation**: Move precisely between images using keyboard or UI controls.
- **Dual-Page View**: Toggle between single-page and dual-page (spread) modes.
- **Draggable UI**: A floating control panel that can be positioned anywhere on the screen.
- **Metadata Viewer**: Quickly access tags and related work info.

### 🛠 How to Use
1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/).
2. Install this script.
3. **Please change `something` in the `@match` rules at the beginning of the script to `example.com` or other domains as appropriate.**
4. Ensure script metadata (like `@name:ja` and `@license`) is correctly set.
5. The script will activate automatically when you visit supported sites.

### ⌨️ Keyboard Shortcuts
| Action | Key |
| :--- | :--- |
| **Next Image** | `↓` `→` `PageDown` `Space` `j` |
| **Prev Image** | `↑` `←` `PageUp` `Shift + Space` `k` |
| **Toggle Spread** | `d` |
| **Show Info** | `i` |
