import { createElement } from '../utils.js';

/**
 * @param {Object} props
 * @param {Function} props.onFirst
 * @param {Function} props.onPrev
 * @param {Function} props.onNext
 * @param {Function} props.onLast
 */
export function createNavigationButtons({ onFirst, onPrev, onNext, onLast }) {
  const configs = [
    { text: '<<', title: 'Go to First', action: onFirst },
    { text: '<', title: 'Go to Previous', action: onPrev },
    { text: '>', title: 'Go to Next', action: onNext },
    { text: '>>', title: 'Go to Last', action: onLast }
  ];

  return configs.map(cfg => createElement('button', {
    className: 'comic-helper-button',
    textContent: cfg.text,
    title: cfg.title,
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        cfg.action();
        if (e.target instanceof HTMLElement) e.target.blur();
      }
    }
  }));
}
