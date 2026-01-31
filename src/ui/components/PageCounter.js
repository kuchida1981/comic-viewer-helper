import { createElement } from '../utils.js';

/**
 * @param {Object} props
 * @param {number} props.current
 * @param {number} props.total
 * @param {Function} props.onJump
 */
export function createPageCounter({ current, total, onJump }) {
  const input = /** @type {HTMLInputElement} */ (createElement('input', {
    type: 'number',
    className: 'comic-helper-page-input',
    attributes: { min: 1 },
    events: {
      keydown: (e) => {
        if (e instanceof KeyboardEvent && e.key === 'Enter') {
          e.preventDefault();
          onJump(input.value);
        }
      },
      focus: () => {
        input.select();
      }
    }
  }));
  
  input.value = String(current);

  const totalLabel = createElement('span', {
    id: 'comic-total-counter',
    textContent: ` / ${total}`
  });

  const wrapper = createElement('span', {
    className: 'comic-helper-counter-wrapper'
  }, [input, totalLabel]);

  return { wrapper, input, totalLabel };
}
