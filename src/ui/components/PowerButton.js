import { createElement } from '../utils.js';

/**
 * @param {Object} props
 * @param {boolean} props.isEnabled
 * @param {Function} props.onClick
 */
export function createPowerButton({ isEnabled, onClick }) {
  const el = createElement('button', {
    className: `comic-helper-power-btn ${isEnabled ? 'enabled' : 'disabled'}`,
    title: isEnabled ? 'Disable Comic Viewer Helper' : 'Enable Comic Viewer Helper',
    textContent: '⚡',
    style: {
      marginRight: isEnabled ? '8px' : '0'
    },
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }
    }
  });

  return {
    el,
    /** @param {boolean} enabled */
    update: (enabled) => {
      el.className = `comic-helper-power-btn ${enabled ? 'enabled' : 'disabled'}`;
      el.title = enabled ? 'Disable Comic Viewer Helper' : 'Enable Comic Viewer Helper';
      el.style.marginRight = enabled ? '8px' : '0';
    }
  };
}
