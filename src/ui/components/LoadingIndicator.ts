import { createElement } from '../utils';

export interface LoadingIndicatorProps {
  isLoading: boolean;
}

export interface LoadingIndicatorComponent {
  el: HTMLElement;
  update: (isLoading: boolean) => void;
}

export function createLoadingIndicator({ isLoading }: LoadingIndicatorProps): LoadingIndicatorComponent {
  const el = createElement('div', { id: 'comic-helper-loading' });
  const spinner = createElement('div', { className: 'comic-helper-spinner' });
  const text = createElement('span', { textContent: 'Loading...' });

  el.appendChild(spinner);
  el.appendChild(text);

  if (isLoading) {
    el.classList.add('visible');
  }

  const update = (newLoading: boolean) => {
    if (newLoading) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  };

  return { el, update };
}