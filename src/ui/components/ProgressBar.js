import { createElement } from '../utils.js';

/**
 * @typedef {Object} ProgressBarComponent
 * @property {HTMLElement} el
 * @property {function(number, number): void} update
 */

/**
 * Create a progress bar component
 * @returns {ProgressBarComponent}
 */
export function createProgressBar() {
  const bar = createElement('div', { className: 'comic-helper-progress-fill' });
  const el = createElement('div', { id: 'comic-helper-progress-bar' }, [bar]);

  /**
   * @param {number} current Current image index (0-based)
   * @param {number} total Total number of images
   */
  const update = (current, total) => {
    if (total <= 0) return;
    const percentage = Math.min(((current + 1) / total) * 100, 100);
    bar.style.width = `${percentage}%`;
  };

  return { el, update };
}
