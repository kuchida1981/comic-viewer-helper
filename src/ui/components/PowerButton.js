import { createElement } from '../utils.js';

/**
 * @param {Object} props
 * @param {boolean} props.isEnabled
 * @param {Function} props.onClick
 */
export function createPowerButton({ isEnabled, onClick }) {
  return createElement('button', {
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
}
