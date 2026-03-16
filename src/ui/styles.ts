const PALETTE = {
  white: '#fff',
  nearWhite: '#eee',
  lightGray: '#ccc',
  gray: '#888',
  darkGray: '#444',
  veryDarkGray: '#333',
  deepBlack: '#1a1a1a',
  overlayBlack: 'rgba(0, 0, 0, 0.7)',
  modalOverlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLarge: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.2)',
  success: '#4CAF50',
  successHover: '#45a049',
  border: '#333',
  lightBorder: '#444',
  darkBorder: '#222',
} as const;

export const COLORS = {
  background: {
    panel: PALETTE.overlayBlack,
    button: PALETTE.white,
    buttonHover: PALETTE.nearWhite,
    modal: PALETTE.deepBlack,
    modalOverlay: PALETTE.modalOverlay,
    input: PALETTE.darkBorder,
    tag: PALETTE.veryDarkGray,
    tagHover: PALETTE.darkGray,
    tooltip: PALETTE.overlayBlack,
    progress: PALETTE.success,
    successHover: PALETTE.successHover,
  },
  text: {
    primary: PALETTE.nearWhite,
    secondary: PALETTE.lightGray,
    muted: PALETTE.gray,
    inverted: PALETTE.veryDarkGray,
    success: PALETTE.success,
    white: PALETTE.white,
  },
  border: {
    default: PALETTE.border,
    light: PALETTE.lightBorder,
    dark: PALETTE.darkBorder,
    accent: PALETTE.success,
  },
  shadow: {
    default: PALETTE.shadow,
    large: PALETTE.shadowLarge,
    light: PALETTE.shadowLight,
  }
} as const;

export const styles = `
  #comic-helper-ui {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    gap: 8px;
    background-color: ${COLORS.background.panel};
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 10px ${COLORS.shadow.default};
    cursor: move;
    user-select: none;
    touch-action: none;
    align-items: center;
    white-space: nowrap;
    width: max-content;
    opacity: 0.3;
    transition: opacity 0.3s;
  }

  #comic-helper-ui:hover {
    opacity: 1.0;
  }

  .comic-helper-button {
    cursor: pointer;
    padding: 6px 12px;
    border: none;
    background: ${COLORS.background.button};
    color: ${COLORS.text.inverted};
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    min-width: 50px;
    transition: background 0.2s;
  }
  .comic-helper-button:hover {
    background: ${COLORS.background.buttonHover};
  }

  .comic-helper-icon-btn {
    cursor: pointer;
    border: none;
    background: transparent;
    font-size: 16px;
    padding: 0 4px;
    font-weight: bold;
    transition: color 0.2s, opacity 0.2s;
  }
  .comic-helper-icon-btn:hover {
    opacity: 0.8;
  }
  .comic-helper-power-btn.enabled { color: ${COLORS.text.success}; }
  .comic-helper-power-btn.disabled { color: ${COLORS.text.muted}; }

  .comic-helper-favorite-btn {
    cursor: pointer;
    border: none;
    background: transparent;
    padding: 0 4px;
    transition: color 0.2s, transform 0.2s;
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
  }
  .comic-helper-favorite-btn:hover {
    transform: scale(1.2);
  }
  .comic-helper-favorite-btn.active {
    color: #ff4081; /* Pinkish heart */
  }
  .comic-helper-favorite-btn.inactive {
    color: ${COLORS.text.muted};
  }

  .comic-helper-counter-wrapper {
    color: ${COLORS.text.primary};
    font-size: 14px;
    font-weight: bold;
    padding: 0 8px;
    display: flex;
    align-items: center;
    user-select: none;
  }

  .comic-helper-page-input {
    width: 45px;
    background: transparent;
    border: 1px solid transparent;
    color: ${COLORS.text.primary};
    font-size: 14px;
    font-weight: bold;
    text-align: right;
    padding: 2px;
    outline: none;
    margin: 0;
    transition: border 0.2s, background 0.2s;
  }
  .comic-helper-page-input:focus {
    border: 1px solid ${COLORS.border.light};
    background: rgba(255, 255, 255, 0.1);
  }
  /* Hide spin buttons */
  .comic-helper-page-input::-webkit-outer-spin-button,
  .comic-helper-page-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .comic-helper-page-input[type=number] {
    -moz-appearance: textfield;
  }

  .comic-helper-label {
    display: flex;
    align-items: center;
    color: ${COLORS.text.primary};
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    margin-right: 8px;
  }
  .comic-helper-label input {
    margin-right: 4px;
  }

  .comic-helper-adjust-btn {
    cursor: pointer;
    padding: 2px 6px;
    border: 1px solid ${COLORS.border.light};
    background: transparent;
    color: ${COLORS.text.primary};
    border-radius: 4px;
    font-size: 10px;
    margin-left: 4px;
    font-weight: normal;
    transition: background 0.2s;
  }
  .comic-helper-adjust-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .comic-helper-autoplay-wrapper {
    margin-left: 8px;
    padding-left: 8px;
    border-left: 1px solid ${COLORS.border.light};
  }

  .comic-helper-autoplay-input {
    width: 35px;
    background: transparent;
    border: 1px solid ${COLORS.border.light};
    color: ${COLORS.text.primary};
    font-size: 12px;
    padding: 1px 4px;
    border-radius: 4px;
    outline: none;
    text-align: center;
    margin-right: 4px;
  }

  .comic-helper-sec-label {
    color: ${COLORS.text.muted};
    font-size: 10px;
  }

  /* Metadata Modal Styles */
  .comic-helper-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${COLORS.background.modalOverlay};
    backdrop-filter: blur(4px);
    z-index: 20000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .comic-helper-modal-content {
    background: ${COLORS.background.modal};
    color: ${COLORS.text.primary};
    width: 80%;
    max-width: 800px;
    max-height: 80%;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px ${COLORS.shadow.large};
    overflow-y: auto;
    position: relative;
    border: 1px solid ${COLORS.border.default};
  }

  .comic-helper-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    color: ${COLORS.text.muted};
    font-size: 24px;
    cursor: pointer;
    line-height: 1;
  }
  .comic-helper-modal-close:hover {
    color: ${COLORS.text.primary};
  }

  .comic-helper-modal-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 20px;
    border-bottom: 1px solid ${COLORS.border.default};
    padding-bottom: 10px;
  }

  .comic-helper-section-title {
    font-size: 14px;
    color: ${COLORS.text.muted};
    margin: 20px 0 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .comic-helper-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .comic-helper-tag-chip {
    background: ${COLORS.background.tag};
    color: ${COLORS.text.secondary};
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .comic-helper-tag-chip:hover {
    background: ${COLORS.background.tagHover};
    color: ${COLORS.text.primary};
  }
  .comic-helper-tag-chip.active {
    background: ${COLORS.border.accent};
    color: ${COLORS.text.white};
  }
  .comic-helper-tag-chip.active:hover {
    background: ${COLORS.background.successHover};
    color: ${COLORS.text.white};
  }

  /* Tag type color variants */
  .comic-helper-tag-chip--artist {
    background: #5c3d4a;
    color: #f0d0dc;
  }
  .comic-helper-tag-chip--artist:hover {
    background: #7a5060;
    color: #fff;
  }

  .comic-helper-tag-chip--character {
    background: #3d5c4a;
    color: #d0f0dc;
  }
  .comic-helper-tag-chip--character:hover {
    background: #507a60;
    color: #fff;
  }

  .comic-helper-tag-chip--circle {
    background: #3d4a5c;
    color: #d0dcf0;
  }
  .comic-helper-tag-chip--circle:hover {
    background: #50607a;
    color: #fff;
  }

  .comic-helper-tag-chip--fanzine {
    background: #5c4a3d;
    color: #f0dcd0;
  }
  .comic-helper-tag-chip--fanzine:hover {
    background: #7a6050;
    color: #fff;
  }

  .comic-helper-tag-chip--genre {
    background: #4a4a4a;
    color: #d0d0d0;
  }
  .comic-helper-tag-chip--genre:hover {
    background: #606060;
    color: #fff;
  }

  .comic-helper-tag-chip--magazine {
    background: #4a3d5c;
    color: #dcd0f0;
  }
  .comic-helper-tag-chip--magazine:hover {
    background: #60507a;
    color: #fff;
  }

  .comic-helper-tag-chip--parody {
    background: #3d5c5c;
    color: #d0f0f0;
  }
  .comic-helper-tag-chip--parody:hover {
    background: #507a7a;
    color: #fff;
  }

  .comic-helper-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    margin-top: 10px;
  }

  .comic-helper-related-item {
    text-decoration: none;
    color: #ccc;
    font-size: 11px;
    transition: transform 0.2s;
  }
  .comic-helper-related-item:hover {
    transform: translateY(-4px);
  }

  .comic-helper-related-thumb {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 4px;
    background: ${COLORS.border.dark};
    margin-bottom: 6px;
  }

  .comic-helper-related-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }

  /* Search Modal Styles */
  .comic-helper-search-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }

  .comic-helper-search-form {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .comic-helper-search-input {
    flex: 1;
    background: ${COLORS.background.input};
    border: 1px solid ${COLORS.border.light};
    color: ${COLORS.text.primary};
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
  }

  .comic-helper-search-input:focus {
    border-color: ${COLORS.border.accent};
  }

  .comic-helper-search-submit {
    background: ${COLORS.background.progress};
    color: ${COLORS.text.white};
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }

  .comic-helper-search-submit:hover {
    background: ${COLORS.background.successHover};
  }

  /* Search History Styles */
  .comic-helper-search-history {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: -8px;
    align-items: center;
    min-height: 24px;
  }

  .comic-helper-search-history-label {
    font-size: 12px;
    color: ${COLORS.text.muted};
    margin-right: 4px;
  }

  .comic-helper-search-history-item {
    background: ${COLORS.background.tag};
    color: ${COLORS.text.secondary};
    border: 1px solid ${COLORS.border.light};
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .comic-helper-search-history-item:hover {
    background: ${COLORS.background.tagHover};
    color: ${COLORS.text.primary};
    border-color: #666;
  }

  .comic-helper-search-header-tag {
    cursor: pointer;
    color: ${COLORS.text.primary};
    border-bottom: 1px dotted ${COLORS.text.muted};
    transition: color 0.2s, border-bottom-color 0.2s;
    margin: 0 4px;
    display: inline-block;
  }
  .comic-helper-search-header-tag:hover {
    color: ${COLORS.border.accent};
    border-bottom-color: ${COLORS.border.accent};
  }

  /* Search Results Styles */
  .comic-helper-search-results-section {
    margin-top: 4px;
  }

  .comic-helper-search-no-results {
    color: ${COLORS.text.muted};
    font-size: 14px;
    padding: 12px 0;
  }

  .comic-helper-search-result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
    margin-top: 10px;
  }

  /* Library Tabs */
  .comic-helper-library-tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid ${COLORS.border.light};
    margin-bottom: 16px;
  }

  .comic-helper-library-tab {
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: ${COLORS.text.muted};
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    padding: 8px 16px;
    margin-bottom: -1px;
    transition: color 0.2s, border-bottom-color 0.2s;
  }

  .comic-helper-library-tab:hover {
    color: ${COLORS.text.primary};
  }

  .comic-helper-library-tab.active {
    color: ${COLORS.text.primary};
    border-bottom-color: ${COLORS.border.accent};
  }

  /* Sort Menu */
  .comic-helper-sort-menu {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .comic-helper-sort-label {
    font-size: 11px;
    color: ${COLORS.text.muted};
  }

  .comic-helper-sort-btn {
    background: ${COLORS.background.tag};
    border: 1px solid ${COLORS.border.light};
    border-radius: 12px;
    color: ${COLORS.text.secondary};
    cursor: pointer;
    font-size: 11px;
    padding: 2px 10px;
    transition: all 0.2s;
  }

  .comic-helper-sort-btn:hover {
    background: ${COLORS.background.tagHover};
    color: ${COLORS.text.primary};
  }

  .comic-helper-sort-btn.active {
    background: ${COLORS.background.progress};
    border-color: ${COLORS.border.accent};
    color: ${COLORS.text.white};
  }

  /* Library Item Favorite Toggle */
  .comic-helper-item-favorite-btn {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: ${COLORS.text.muted};
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s, color 0.15s;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .comic-helper-item-favorite-btn.active {
    color: #ff4081;
  }

  .comic-helper-favorites-item:hover .comic-helper-item-favorite-btn {
    opacity: 1;
  }

  /* View count badge */
  .comic-helper-view-count {
    font-size: 10px;
    color: ${COLORS.text.muted};
    margin-top: 2px;
  }

  .comic-helper-favorites-trend-section {
    padding: 8px 0 12px;
    border-bottom: 1px solid ${COLORS.border.light};
    margin-bottom: 12px;
  }
  .comic-helper-favorites-trend-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .comic-helper-favorites-trend-label {
    font-size: 11px;
    color: ${COLORS.text.muted};
  }
  .comic-helper-trend-toggle-btn {
    background: transparent;
    border: none;
    color: ${COLORS.border.accent};
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    transition: opacity 0.2s;
  }
  .comic-helper-trend-toggle-btn:hover {
    opacity: 0.7;
  }
  .comic-helper-favorites-trend-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 120px;
    overflow-y: auto;
  }

  .comic-helper-favorites-item {
    position: relative;
  }
  .comic-helper-favorites-delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
    z-index: 1;
  }
  .comic-helper-favorites-item:hover .comic-helper-favorites-delete-btn {
    opacity: 1;
  }
  .comic-helper-search-result-item {
    text-decoration: none;
    color: ${COLORS.text.secondary};
    font-size: 11px;
    transition: transform 0.2s;
  }
  .comic-helper-search-result-item:hover {
    transform: translateY(-4px);
  }

  .comic-helper-search-result-thumb {
    width: 100%;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 4px;
    background: ${COLORS.border.dark};
    margin-bottom: 6px;
  }

  .comic-helper-search-result-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
  }

  .comic-helper-search-pagination {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid ${COLORS.border.default};
    justify-content: center;
  }

  .comic-helper-search-page-btn {
    background: ${COLORS.background.tag};
    color: ${COLORS.text.secondary};
    border: 1px solid ${COLORS.border.light};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    min-width: 32px;
    transition: all 0.2s;
  }

  .comic-helper-search-page-btn:hover:not(:disabled) {
    background: ${COLORS.background.tagHover};
    color: ${COLORS.text.primary};
    border-color: #666;
  }

  .comic-helper-search-page-btn.active {
    background: ${COLORS.background.progress};
    color: ${COLORS.text.white};
    border-color: ${COLORS.border.accent};
    cursor: default;
  }

  .comic-helper-search-page-btn:disabled:not(.active) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .comic-helper-search-page-btn.type-next,
  .comic-helper-search-page-btn.type-prev {
    font-weight: bold;
    padding: 4px 12px;
  }

  .comic-helper-search-results-wrapper {
    position: relative;
    min-height: 100px;
  }

  .comic-helper-search-spinner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    border-radius: 12px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
  }

  .comic-helper-search-spinner-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .comic-helper-search-updating {
    margin-left: 8px;
    font-size: 0.8em;
    color: ${COLORS.text.muted};
  }

  /* Help Modal Styles */
  .comic-helper-shortcut-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comic-helper-shortcut-row {
    display: grid;
    grid-template-columns: minmax(120px, 1.5fr) minmax(100px, 1fr) 2fr;
    gap: 12px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid ${COLORS.border.dark};
  }

  @media (max-width: 600px) {
    .comic-helper-shortcut-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 12px 0;
    }
  }

  .comic-helper-shortcut-keys {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .comic-helper-kbd {
    background: ${COLORS.background.tagHover};
    border: 1px solid #555;
    border-radius: 4px;
    box-shadow: 0 1px 0 ${COLORS.shadow.light}, 0 0 0 2px ${COLORS.border.default} inset;
    color: ${COLORS.text.primary};
    display: inline-block;
    font-size: 11px;
    font-family: monospace;
    line-height: 1.4;
    margin: 0 2px;
    padding: 2px 6px;
    white-space: nowrap;
  }

  .comic-helper-shortcut-label {
    color: ${COLORS.text.primary};
    font-size: 13px;
    font-weight: bold;
  }

  .comic-helper-shortcut-desc {
    color: #bbb;
    font-size: 13px;
  }

  /* Progress Bar Styles */
  #comic-helper-progress-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10001;
    pointer-events: none;
  }

  .comic-helper-progress-fill {
    height: 100%;
    background: ${COLORS.background.progress};
    width: 0;
    transition: width 0.2s ease-out;
    box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
  }

  /* Resume Notification Styles */
  #comic-helper-resume-notification {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10002;
    background: rgba(0, 0, 0, 0.9);
    color: ${COLORS.text.white};
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px ${COLORS.shadow.large};
    font-size: 14px;
  }

  .comic-helper-resume-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.2s;
  }

  .comic-helper-resume-continue {
    background: ${COLORS.background.progress};
    color: ${COLORS.text.white};
  }

  .comic-helper-resume-continue:hover {
    background: ${COLORS.background.successHover};
  }

  .comic-helper-resume-skip {
    background: #666;
    color: ${COLORS.text.white};
  }

  .comic-helper-resume-skip:hover {
    background: #555;
  }

  .comic-helper-resume-close {
    background: transparent;
    color: ${COLORS.text.white};
    padding: 2px 8px;
    font-size: 18px;
  }

  .comic-helper-resume-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  /* Loading Indicator Styles */
  #comic-helper-loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10003;
    background: ${COLORS.background.tooltip};
    color: ${COLORS.text.white};
    padding: 16px 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px ${COLORS.shadow.large};
    font-size: 14px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s;
  }

  #comic-helper-loading.visible {
    opacity: 1;
  }

  .comic-helper-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid ${COLORS.text.white};
    border-radius: 50%;
    animation: comic-helper-spin 1s linear infinite;
  }

  @keyframes comic-helper-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Global states */
  html.comic-helper-enabled {
    overflow: hidden !important;
  }
`;

/**
 * Inject styles into the document
 */
export function injectStyles(): void {
  const id = 'comic-helper-style';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = styles;
  document.head.appendChild(style);
}
