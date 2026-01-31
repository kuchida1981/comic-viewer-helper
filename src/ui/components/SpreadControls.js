import { createElement } from '../utils.js';

/**
 * @param {Object} props
 * @param {boolean} props.isDualViewEnabled
 * @param {Function} props.onToggle
 * @param {Function} props.onAdjust
 */
export function createSpreadControls({ isDualViewEnabled, onToggle, onAdjust }) {
  const checkbox = createElement('input', {
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
  });

  const label = createElement('label', {
    className: 'comic-helper-label'
  }, [checkbox, 'Spread']);

  const adjustBtn = isDualViewEnabled ? createElement('button', {
    className: 'comic-helper-adjust-btn',
    textContent: 'Adjust',
    title: 'Adjust Spread Alignment',
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAdjust();
      }
    }
  }) : null;

  return { label, adjustBtn };
}
