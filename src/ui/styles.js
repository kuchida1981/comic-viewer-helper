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

  .comic-helper-power-btn {
    cursor: pointer;
    border: none;
    background: transparent;
    font-size: 16px;
    padding: 0 4px;
    font-weight: bold;
    transition: color 0.2s;
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
`;

/**
 * Inject styles into the document
 */
export function injectStyles() {
  const id = 'comic-helper-style';
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = styles;
  document.head.appendChild(style);
}
