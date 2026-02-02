import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {boolean} props.resumeEnabled
 * @param {Function} props.onToggle
 */
export function createResumeToggle({ resumeEnabled, onToggle }) {
  const checkbox = /** @type {HTMLInputElement} */ (createElement('input', {
    type: 'checkbox',
    checked: resumeEnabled,
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
  }, [checkbox, t('ui.resume')]);

  const el = createElement('div', {
    style: { display: 'flex', alignItems: 'center' }
  }, [label]);

  return {
    el,
    /** @param {boolean} enabled */
    update: (enabled) => {
      checkbox.checked = enabled;
    }
  };
}
