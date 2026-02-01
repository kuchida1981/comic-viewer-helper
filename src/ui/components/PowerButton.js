import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {boolean} props.isEnabled
 * @param {Function} props.onClick
 */
export function createPowerButton({ isEnabled, onClick }) {
  const el = createElement('button', {
    className: `comic-helper-power-btn ${isEnabled ? 'enabled' : 'disabled'}`,
    title: isEnabled ? t('ui.disable') : t('ui.enable'),
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
      el.title = enabled ? t('ui.disable') : t('ui.enable');
      el.style.marginRight = enabled ? '8px' : '0';
    }
  };
}
