## ADDED Requirements

### Requirement: Layout Stability on Screen Edge
GUIパネルは、画面の右端や下端に配置された場合でも、その内部レイアウト（ボタンの並び、サイズ、テキストの折り返し）を維持しなければならない（SHALL）。

#### Scenario: Dragging to Right Edge
- **WHEN** ユーザーがGUIパネルを画面の右端ギリギリにドラッグしたとき
- **THEN** パネル内のボタンやテキストが折り返されたり、圧縮されたりせず、元の形状を維持して表示される（一部が画面外に出ることは許容される）。

#### Scenario: Window Resize
- **WHEN** ブラウザのウィンドウサイズを変更し、GUIパネルが相対的に画面端に位置するようになったとき
- **THEN** パネルの幅が勝手に縮小されず、最大コンテンツ幅を維持する。
