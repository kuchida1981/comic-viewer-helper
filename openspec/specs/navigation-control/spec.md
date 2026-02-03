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
The system SHALL provide keybindings for navigating between images. ナビゲーションは、現在の画像のインデックスに基づいて行われ、遷移先の画像が読み込み完了していない場合は読み込みを待機してから実行されなければならない（SHALL）。また、ブラウザの標準スクロールバーが非表示の場合であっても、これらの操作は完全に機能し続けなければならない。

#### Scenario: 次のページへ（ロード済み）
- **WHEN** ユーザーが「次へ」のキー（`j`, `ArrowDown`, `PageDown`, `ArrowRight`, `Space`）を押す
- **AND** 次の画像が既に読み込み完了している
- **THEN** ビューポートが即座に次の画像または見開き画像までスクロールする
- **AND** 画像/見開き画像がビューポートの垂直方向中央に配置される

#### Scenario: 次のページへ（ロード未完了）
- **WHEN** ユーザーが「次へ」のキーを押す
- **AND** 次の画像がまだ読み込まれていない
- **THEN** 画面にローディング表示が現れ、スクロールは待機される
- **AND** 画像の読み込みが完了次第、自動的にスクロールが実行される

#### Scenario: 前のページへ
- **WHEN** ユーザーが「前へ」のキー（`k`, `ArrowUp`, `PageUp`, `ArrowLeft`, `Shift+Space`）を押す
- **THEN** ビューポートが前の画像または見開き画像までスクロールする
- **AND** 画像/見開き画像がビューポートの垂直方向中央に配置される

### Requirement: Scroll to Edge Loading Wait
ナビゲーションGUIの「最初に戻る」「最後に進む」ボタンを使用した移動（`scrollToEdge`）においても、移動先の画像が未ロードの場合は読み込みを待機し、完了後に適切なレイアウトでスクロールしなければならない（SHALL）。

#### Scenario: 最後のページへ移動（ロード済み）
- **WHEN** ユーザーが「最後に進む」ボタンをクリックする
- **AND** 最後の画像が既に読み込まれている
- **THEN** ビューポートが最後の画像の位置までスクロールする
- **AND** 見開き表示などのレイアウトが正しく適用されている

#### Scenario: 最後のページへ移動（ロード未完了）
- **WHEN** ユーザーが「最後に進む」ボタンをクリックする
- **AND** 最後の画像が遅延読み込み(`loading="lazy"`)などで未ロードの状態である
- **THEN** 画面にローディング表示が現れ、スクロールは待機される
- **AND** 画像の読み込みが完了次第、レイアウトが計算され、スクロールが実行される

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

### Requirement: Centralized Shortcut Management
システムは、すべてのキーボードショートカットの定義（ID、キー、修飾キー）を一元管理しなければならない（SHALL）。表示用のラベルや説明文は、ID を基に多言語対応辞書から取得されるものとし、ヘルプモーダルとイベントハンドラの双方が同一のデータソースを参照することを保証する。

#### Scenario: IDベースのショートカット管理
- **WHEN** 開発者が一元管理されているデータ構造に新しいショートカットを ID（例: `nextPage`）と共に追加する
- **THEN** システムは現在の言語設定に応じた適切なラベルと説明文を辞書から取得し、ヘルプモーダルに表示する
- **AND** キーボードイベントハンドラは、ラベル名ではなく ID に基づいて動作を決定する

### Requirement: Help Activation Shortcut
システムは、ヘルプ画面を即座に表示/非表示するためのキーボードショートカットを提供しなければならない（SHALL）。

#### Scenario: Toggle help with '?' key
- **WHEN** ユーザーが `?` キーを押下する
- **THEN** ヘルプモーダルの表示状態がトグルされる（表示 ↔ 非表示）

