## 1. UI & State Management

- [x] 1.1 Implement state management for `isDualViewEnabled` using `localStorage` (read on init, write on toggle).
- [x] 1.2 Add a toggle checkbox/button to the navigation UI (`createNavigationUI`) that reflects and controls the state.
- [x] 1.3 Add keyboard event handler for the `d` key in `onKeyDown` to toggle the state.

## 2. Rendering Logic

- [x] 2.1 Refactor `fitImagesToViewport` to iterate images and determine layout pairs dynamically based on `isDualViewEnabled` and image dimensions (`naturalWidth` > `naturalHeight`).
- [x] 2.2 Implement the dual-page layout logic: calculate positions and sizes to render two portrait images side-by-side (Right: N, Left: N+1) within the viewport.
- [x] 2.3 Implement the single-page layout logic (centering) for landscape images even when in dual mode.
- [x] 2.4 Ensure the loop correctly advances the index (by 1 for single/landscape, by 2 for pairs).

## 3. Navigation & Interaction

- [x] 3.1 Update `scrollToImage` (or navigation logic) to handle "view units" instead of single images, ensuring "Next" skips past both images in a pair.
- [x] 3.2 Verify and adjust `updatePageCounter` to reflect the currently visible page numbers correctly in dual mode (e.g., displaying "5-6 / 20").
- [x] 3.3 Ensure resize and scroll event handlers correctly trigger the updated layout logic without glitches.
