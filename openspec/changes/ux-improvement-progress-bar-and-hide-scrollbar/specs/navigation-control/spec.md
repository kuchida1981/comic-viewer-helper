## MODIFIED Requirements

### Requirement: Keyboard Navigation
The system SHALL provide keybindings for navigating between images. ナビゲーションは、アライメントに左右されず安定した挙動を保証するため、ビューポートの座標ではなく、現在の画像のインデックスに基づいて行われなければならない（SHALL）。また、ブラウザの標準スクロールバーが非表示の場合であっても、これらの操作は完全に機能し続けなければならない。

#### Scenario: 次のページへ
- **WHEN** ユーザーが「次へ」のキー（`j`, `ArrowDown`, `PageDown`, `ArrowRight`, `Space`）を押す
- **THEN** ビューポートが次の画像または見開き画像までスクロールする
- **AND** 画像/見開き画像がビューポートの垂直方向中央に配置される

#### Scenario: 前のページへ
- **WHEN** ユーザーが「前へ」のキー（`k`, `ArrowUp`, `PageUp`, `ArrowLeft`, `Shift+Space`）を押す
- **THEN** ビューポートが前の画像または見開き画像までスクロールする
- **AND** 画像/見開き画像がビューポートの垂直方向中央に配置される
