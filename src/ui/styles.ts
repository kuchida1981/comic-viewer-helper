export const styles = `
  #comic-helper-ui {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    gap: 8px;
    background-color: rgba(0, 0, 0, 0.7);
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
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
    background: #fff;
    color: #333;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    min-width: 50px;
    transition: background 0.2s;
  }
  .comic-helper-button:hover {
    background: #eee;
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
  .comic-helper-power-btn.enabled { color: #4CAF50; }
  .comic-helper-power-btn.disabled { color: #888; }

  .comic-helper-counter-wrapper {
    color: #fff;
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
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    text-align: right;
    padding: 2px;
    outline: none;
    margin: 0;
    transition: border 0.2s, background 0.2s;
  }
  .comic-helper-page-input:focus {
    border: 1px solid #fff;
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
    color: #fff;
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
    border: 1px solid #fff;
    background: transparent;
    color: #fff;
    border-radius: 4px;
    font-size: 10px;
    margin-left: 4px;
    font-weight: normal;
    transition: background 0.2s;
  }
  .comic-helper-adjust-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Metadata Modal Styles */
  .comic-helper-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 20000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .comic-helper-modal-content {
    background: #1a1a1a;
    color: #eee;
    width: 80%;
    max-width: 800px;
    max-height: 80%;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    overflow-y: auto;
    position: relative;
    border: 1px solid #333;
  }

  .comic-helper-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    color: #888;
    font-size: 24px;
    cursor: pointer;
    line-height: 1;
  }
  .comic-helper-modal-close:hover {
    color: #fff;
  }

  .comic-helper-modal-title {
    margin-top: 0;
    margin-bottom: 20px;
    font-size: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }

  .comic-helper-section-title {
    font-size: 14px;
    color: #888;
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
    background: #333;
    color: #ccc;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .comic-helper-tag-chip:hover {
    background: #444;
    color: #fff;
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
    background: #222;
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
    background: #222;
    border: 1px solid #444;
    color: #fff;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s;
  }

  .comic-helper-search-input:focus {
    border-color: #4CAF50;
  }

  .comic-helper-search-submit {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s;
  }

  .comic-helper-search-submit:hover {
    background: #45a049;
  }

  /* Help Modal Styles */
  .comic-helper-shortcut-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .comic-helper-shortcut-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #222;
  }

  .comic-helper-shortcut-keys {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    max-width: 40%;
  }

  .comic-helper-kbd {
    background: #444;
    border: 1px solid #555;
    border-radius: 4px;
    box-shadow: 0 1px 0 rgba(0,0,0,0.2), 0 0 0 2px #333 inset;
    color: #eee;
    display: inline-block;
    font-size: 11px;
    font-family: monospace;
    line-height: 1.4;
    margin: 0 2px;
    padding: 2px 6px;
    white-space: nowrap;
  }

  .comic-helper-shortcut-label {
    color: #eee;
    font-size: 13px;
    font-weight: bold;
    flex: 1;
    margin: 0 12px;
  }

  .comic-helper-shortcut-desc {
    color: #bbb;
    font-size: 13px;
    flex: 1;
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
    background: #4CAF50;
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
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
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
    background: #4CAF50;
    color: white;
  }

  .comic-helper-resume-continue:hover {
    background: #45a049;
  }

  .comic-helper-resume-skip {
    background: #666;
    color: white;
  }

  .comic-helper-resume-skip:hover {
    background: #555;
  }

  .comic-helper-resume-close {
    background: transparent;
    color: white;
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
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
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
    border-top: 3px solid #fff;
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
