import { createElement } from '../utils';

export interface ProgressBarComponent {
  el: HTMLElement;
  update: (current: number, total: number) => void;
}

export function createProgressBar(): ProgressBarComponent {
  const bar = createElement('div', { className: 'comic-helper-progress-fill' });
  const el = createElement('div', { id: 'comic-helper-progress-bar' }, [bar]);

  const update = (current: number, total: number) => {
    if (total <= 0) return;
    const percentage = Math.min(((current + 1) / total) * 100, 100);
    bar.style.width = `${percentage}%`;
  };

  return { el, update };
}