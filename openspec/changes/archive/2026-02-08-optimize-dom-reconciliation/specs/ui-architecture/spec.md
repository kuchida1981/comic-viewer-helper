## ADDED Requirements

### Requirement: Efficient DOM Reconciliation
The system SHALL update the DOM by comparing the desired state with the current state and applying only necessary changes (ADD/REMOVE/MOVE/UPDATE), avoiding full re-creation of the component tree whenever possible. This is to ensure rendering performance and visual stability.

#### Scenario: Updating layout mode
- **WHEN** switching between Single and Dual page modes
- **THEN** existing image elements are preserved and moved into/out of wrappers instead of being destroyed and recreated.

#### Scenario: Window resize
- **WHEN** the browser window is resized
- **THEN** the layout is updated to fit the new viewport without destroying DOM elements that remain visible.
