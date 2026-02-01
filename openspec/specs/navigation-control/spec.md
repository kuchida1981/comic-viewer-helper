# navigation-control

## Purpose
このスペックは、コミックビューアのナビゲーション制御（キーボード操作、GUIインタラクション、UIの位置管理など）に関する要件を定義します。
## Requirements
### Requirement: Draggable Navigation Panel
The navigation GUI panel SHALL be draggable by the user using mouse interactions. This allows users to move the panel if it obstructs content.

#### Scenario: Dragging the panel
- **WHEN** the user presses the mouse button down on the navigation panel
- **AND** moves the mouse cursor while holding the button
- **THEN** the panel's position updates to follow the cursor

### Requirement: Persistent Panel Position
The system SHALL persist the screen coordinates of the navigation panel and restore them upon page reload.

#### Scenario: Restore position on reload
- **WHEN** the user moves the panel to a specific location
- **AND** reloads the page
- **THEN** the panel appears at the same location as before the reload

### Requirement: Keyboard Navigation
The system SHALL provide keybindings for navigating between images. ナビゲーションは、アライメントに左右されず安定した挙動を保証するため、ビューポートの座標ではなく、現在の画像のインデックスに基づいて行われなければならない（SHALL）。

#### Scenario: 次のページへ
- **WHEN** ユーザーが「次へ」のキー（`j`, `ArrowDown`, `PageDown`, `ArrowRight`, `Space`）を押す
- **THEN** ビューポートが次の画像または見開き画像までスクロールする
- **AND** 画像/見開き画像がビューポートの垂直方向中央に配置される

#### Scenario: 前のページへ
- **WHEN** ユーザーが「前へ」のキー（`k`, `ArrowUp`, `PageUp`, `ArrowLeft`, `Shift+Space`）を押す
- **THEN** ビューポートが前の画像または見開き画像までスクロールする
- **AND** 画像/見開き画像がビューポートの垂直方向中央に配置される

### Requirement: ページ番号入力フォームの統合
ナビゲーションパネルのページカウンター部分は、直接ページ番号を入力可能なフォームとして機能しなければならない（SHALL）。

#### Scenario: 入力フォームへのフォーカス
- **WHEN** ユーザーがページ番号表示部分をクリックする
- **THEN** ページ番号が編集可能な入力状態になる
- **AND** この間、全体に設定されたキーボードショートカット（j/k等）は無効化される

### Requirement: Layout Stability on Screen Edge
GUIパネルは、画面の右端や下端に配置された場合でも、その内部レイアウト（ボタンの並び、サイズ、テキストの折り返し）を維持しなければならない（SHALL）。

#### Scenario: Dragging to Right Edge
- **WHEN** ユーザーがGUIパネルを画面の右端ギリギリにドラッグしたとき
- **THEN** パネル内のボタンやテキストが折り返されたり、圧縮されたりせず、元の形状を維持して表示される（一部が画面外に出ることは許容される）。

#### Scenario: Window Resize
- **WHEN** ブラウザのウィンドウサイズを変更し、GUIパネルが相対的に画面端に位置するようになったとき
- **THEN** パネルの幅が勝手に縮小されず、最大コンテンツ幅を維持する。

### Requirement: 表示位置の自動追従
ウィンドウサイズが変更された場合や、画像の読み込みによってレイアウトが更新された場合でも、システムは直前に表示されていた画像がビューポート内（可能な限り中央）に維持されるように制御しなければならない（SHALL）。

#### Scenario: Resize restoration
- **WHEN** ユーザーがブラウザのウィンドウサイズを変更する
- **THEN** レイアウト更新後、リサイズ前に表示されていた画像が、再度ビューポートの中央に表示されること

### Requirement: Offset Toggle Shortcut
システムは、見開き表示のオフセットを素早く切り替えるためのキーボードショートカットを提供しなければならない（SHALL）。

#### Scenario: Toggling offset with 'o' key
- **WHEN** ユーザーが `o` キーを押下する
- **AND** スクリプトおよび見開きモードが有効である
- **THEN** 見開きのオフセット状態がトグルされる（0 ↔ 1）

