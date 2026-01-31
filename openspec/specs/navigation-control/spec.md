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
The system SHALL provide `j` and `k` keybindings for navigating between images, mimicking Vim-style navigation.

#### Scenario: Next page with 'j'
- **WHEN** the user presses the `j` key
- **THEN** the view scrolls to the next image (equivalent to "ArrowDown")

#### Scenario: Previous page with 'k'
- **WHEN** the user presses the `k` key
- **THEN** the view scrolls to the previous image (equivalent to "ArrowUp")

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

