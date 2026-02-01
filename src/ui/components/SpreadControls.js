import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {boolean} props.isDualViewEnabled
 * @param {Function} props.onToggle
 * @param {Function} props.onAdjust
 */
export function createSpreadControls({ isDualViewEnabled, onToggle, onAdjust }) {
  const checkbox = /** @type {HTMLInputElement} */ (createElement('input', {
    type: 'checkbox',
    checked: isDualViewEnabled,
    events: {
      change: (e) => {
        if (e.target instanceof HTMLInputElement) {
          onToggle(e.target.checked);
          e.target.blur();
        }
      }
    }
  }));

  const label = createElement('label', {
    className: 'comic-helper-label'
  }, [checkbox, t('ui.spread')]);

  const createAdjustBtn = () => createElement('button', {
    className: 'comic-helper-adjust-btn',
    textContent: t('ui.offset'),
    title: t('ui.shiftOffset'),
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdjust();
      }
    }
  });

  /** @type {HTMLElement | null} */
  let adjustBtn = isDualViewEnabled ? createAdjustBtn() : null;

  const el = createElement('div', {
    style: { display: 'flex', alignItems: 'center' }
  }, [label]);

  if (adjustBtn) el.appendChild(adjustBtn);

  return {
    el,
    /** @param {boolean} enabled */
    update: (enabled) => {
      checkbox.checked = enabled;
      if (enabled) {
        if (!adjustBtn) {
          adjustBtn = createAdjustBtn();
          el.appendChild(adjustBtn);
        }
      } else {
        if (adjustBtn) {
          adjustBtn.remove();
          adjustBtn = null;
        }
      }
    }
  };
}
