## ADDED Requirements

### Requirement: Dual Page Rendering
The system SHALL render two consecutive images side-by-side when "Dual Page Mode" is enabled and both images are portrait-oriented.
The layout MUST follow the Japanese manga reading direction: the earlier page (index N) on the RIGHT, and the later page (index N+1) on the LEFT.

#### Scenario: Rendering two portrait images
- **WHEN** Dual Page Mode is enabled
- **AND** Image N and Image N+1 are both portrait (height >= width)
- **THEN** Image N is displayed on the right half of the container
- **AND** Image N+1 is displayed on the left half of the container
- **AND** Both images fit within the viewport height

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
The system SHALL provide a mechanism to toggle Dual Page Mode on and off via a GUI control (e.g., button or checkbox) in the navigation bar.

#### Scenario: Enabling Dual Page Mode
- **WHEN** The user activates the toggle (currently OFF)
- **THEN** The view re-renders in Dual Page layout
- **AND** The toggle state reflects "ON"

#### Scenario: Disabling Dual Page Mode
- **WHEN** The user deactivates the toggle (currently ON)
- **THEN** The view re-renders in Single Page layout
- **AND** The toggle state reflects "OFF"

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
