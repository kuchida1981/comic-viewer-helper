# dual-page-view Specification

## Purpose
TBD - created by archiving change support-dual-page-display. Update Purpose after archive.
## Requirements
### Requirement: Dual Page Rendering
システムは、「見開きモード（Dual Page Mode）」が有効で、かつ連続する2枚の画像が縦長（portrait）である場合、それらを横並びに描画しなければならない（SHALL）。
ただし、**第1ページ（インデックス 0）および最終ページについては、画像の向きに関わらず常に単一ページとして描画しなければならない（MUST）**。
レイアウトは日本の漫画の読み方向（右綴じ）に従い、前のページ（インデックスN）を**右側**に、次のページ（インデックスN+1）を**左側**に配置しなければならない（MUST）。
ペアリングの基準は `spreadOffset` 状態（0 または 1）によって決定され、現在のスクロール位置によって動的に変動してはならない（SHALL）。

#### Scenario: Rendering two portrait images (Offset 0)
- **WHEN** 見開きモードが有効で、spreadOffset = 0 の場合
- **AND** 画像0と画像1が縦長である
- **THEN** 画像0は第1ページであるため単独で表示される
- **AND** 画像1（右）と画像2（左）がペアとして表示される

#### Scenario: Rendering two portrait images (Offset 1)
- **WHEN** 見開きモードが有効で、spreadOffset = 1 の場合
- **AND** 画像0、画像1、画像2がすべて縦長である
- **THEN** 画像0は第1ページであるため単独で表示される
- **AND** 画像1はオフセットの影響で単独で表示される
- **AND** 画像2（右）と画像3（左）がペアとして表示される

#### Scenario: Rendering the first page alone
- **WHEN** 見開きモードが有効で、全ての画像が縦長である
- **THEN** インデックス 0 の画像（第1ページ）は常に単独で中央に表示される

#### Scenario: Rendering the last page alone
- **WHEN** 見開きモードが有効で、全 N 枚の画像がある
- **THEN** インデックス N-1 の画像（最終ページ）は、たとえ前のページとペアを組める条件であっても、常に単独で中央に表示される

### Requirement: Landscape Image Handling
The system SHALL render a landscape-oriented image (width > height) as a single page, centered in the container, even when Dual Page Mode is enabled. The pairing logic MUST reset after a landscape image, attempting to pair the subsequent images.

#### Scenario: Rendering a landscape image in Dual Mode
- **WHEN** Dual Page Mode is enabled
- **AND** Image N is landscape (width > height)
- **THEN** Image N is displayed alone, centered
- **AND** The next rendering attempt starts from Image N+1

#### Scenario: Resuming pairing after landscape image
- **WHEN** Image N was landscape (displayed alone)
- **AND** Image N+1 and N+2 are portrait
- **THEN** Image N+1 (Right) and N+2 (Left) are displayed as a pair

### Requirement: Mode Toggling
システムは、ナビゲーションバー上のGUIコントロール（ボタンやチェックボックスなど）を通じて、見開きモードのON/OFFを切り替える機能を提供しなければならない（SHALL）。
単一ページモードから見開きモードへ切り替える際、システムは現在フォーカスされているページが（可能であれば）スプレッドの開始側（右側）に表示されるよう、初期 `spreadOffset` （0 または 1）を自動的に計算・設定しなければならない（SHALL）。初期計算後は、手動調整または無効化されるまで、オフセットは固定されなければならない（MUST）。

#### Scenario: Enabling Dual Page Mode (Auto-Offset)
- **WHEN** ユーザーがページ5を見ている状態でトグルを有効にする
- **THEN** システムは、ページ5が見開きの開始ページとなるように Offset=1 を必要と判定する（標準ペアリングが [4-5] だと仮定した場合）
- **AND** spreadOffset=1 で再描画される
- **AND** ページ5が右側に表示される

#### Scenario: Disabling Dual Page Mode
- **WHEN** ユーザーがトグルを無効にする（現在ON）
- **THEN** 単一ページレイアウトで再描画される
- **AND** トグルの状態表示が "OFF" になる

### Requirement: Keyboard Shortcut
The system SHALL toggle Dual Page Mode when the `d` key is pressed, provided no input field is focused.

#### Scenario: Toggling via keyboard
- **WHEN** The user presses the `d` key
- **THEN** The Dual Page Mode state is inverted
- **AND** The view re-renders accordingly

### Requirement: State Persistence
The system SHALL persist the state of Dual Page Mode using `localStorage` so that the user's preference is remembered across sessions and page reloads.

#### Scenario: Restoring state on load
- **WHEN** The user reloads the page
- **AND** The previous state was Dual Page Mode enabled
- **THEN** The viewer initializes in Dual Page Mode

### Requirement: Navigation Adjustment
The system SHALL adjust navigation (Next/Previous commands) to scroll by the visible "view unit" rather than a fixed number of images. If the current view displays a pair, the "Next" command advances past both images.

#### Scenario: Navigating next in Dual Mode
- **WHEN** The current view shows a pair (Image N and N+1)
- **AND** The user triggers the "Next" command
- **THEN** The view scrolls to show the next set (starting from Image N+2)

#### Scenario: Navigating next from single landscape page
- **WHEN** The current view shows a single landscape image (Image N)
- **AND** The user triggers the "Next" command
- **THEN** The view scrolls to show the next set (starting from Image N+1)

### Requirement: Seamless Mode Transition
The system SHALL transition between Single and Dual Page modes without causing visible flicker or significant performance degradation, maintaining a smooth user experience.

#### Scenario: Toggling mode with many images
- **WHEN** the user toggles Dual Page Mode on a page with many loaded images
- **THEN** the view updates instantly without a noticeable "blank" frame caused by total DOM reconstruction.

