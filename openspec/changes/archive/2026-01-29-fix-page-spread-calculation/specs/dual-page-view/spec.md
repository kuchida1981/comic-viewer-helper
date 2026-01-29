## MODIFIED Requirements

### Requirement: Mode Toggling
The system SHALL provide a mechanism to toggle Dual Page Mode on and off via a GUI control (e.g., button or checkbox) in the navigation bar. When switching from Single Page Mode to Dual Page Mode, the system MUST ensure the currently focused page becomes the first page (Right side) of the new spread, regardless of whether it is an odd or even page index.

#### Scenario: Enabling Dual Page Mode
- **WHEN** The user activates the toggle (currently OFF)
- **THEN** The view re-renders in Dual Page layout
- **AND** The toggle state reflects "ON"

#### Scenario: Disabling Dual Page Mode
- **WHEN** The user deactivates the toggle (currently ON)
- **THEN** The view re-renders in Single Page layout
- **AND** The toggle state reflects "OFF"

#### Scenario: Switching to Dual Mode maintains current page focus
- **WHEN** The user switches from Single Page Mode to Dual Page Mode
- **AND** The current view is focused on Page N
- **THEN** The new Dual Page view displays Page N on the Right side
- **AND** Page N+1 is displayed on the Left side (if available and compatible)
