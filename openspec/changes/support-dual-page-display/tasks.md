## 1. UI & State Management

- [ ] 1.1 Implement state management for `isDualViewEnabled` using `localStorage` (read on init, write on toggle).
- [ ] 1.2 Add a toggle checkbox/button to the navigation UI (`createNavigationUI`) that reflects and controls the state.
- [ ] 1.3 Add keyboard event handler for the `d` key in `onKeyDown` to toggle the state.

## 2. Rendering Logic

- [ ] 2.1 Refactor `fitImagesToViewport` to iterate images and determine layout pairs dynamically based on `isDualViewEnabled` and image dimensions (`naturalWidth` > `naturalHeight`).
- [ ] 2.2 Implement the dual-page layout logic: calculate positions and sizes to render two portrait images side-by-side (Right: N, Left: N+1) within the viewport.
- [ ] 2.3 Implement the single-page layout logic (centering) for landscape images even when in dual mode.
- [ ] 2.4 Ensure the loop correctly advances the index (by 1 for single/landscape, by 2 for pairs).

## 3. Navigation & Interaction

- [ ] 3.1 Update `scrollToImage` (or navigation logic) to handle "view units" instead of single images, ensuring "Next" skips past both images in a pair.
- [ ] 3.2 Verify and adjust `updatePageCounter` to reflect the currently visible page numbers correctly in dual mode (e.g., displaying "5-6 / 20").
- [ ] 3.3 Ensure resize and scroll event handlers correctly trigger the updated layout logic without glitches.
