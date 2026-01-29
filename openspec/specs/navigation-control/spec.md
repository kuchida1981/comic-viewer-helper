# navigation-control

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
