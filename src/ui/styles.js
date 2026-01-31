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
