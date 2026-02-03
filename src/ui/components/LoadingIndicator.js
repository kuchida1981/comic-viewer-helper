import { createElement } from '../utils.js';

/**
 * @param {Object} props
 * @param {boolean} props.isLoading
 * @returns {{el: HTMLElement, update: (isLoading: boolean) => void}}
 */
export function createLoadingIndicator({ isLoading }) {
  const el = createElement('div', { id: 'comic-helper-loading' });
  const spinner = createElement('div', { className: 'comic-helper-spinner' });
  const text = createElement('span', { textContent: 'Loading...' });

  el.appendChild(spinner);
  el.appendChild(text);

  if (isLoading) {
    el.classList.add('visible');
  }

  /** @param {boolean} newLoading */
  const update = (newLoading) => {
    if (newLoading) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  };

  return { el, update };
}
