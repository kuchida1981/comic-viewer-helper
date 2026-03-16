import { Store } from '../store';

export class PopUnderBlocker {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  init = (): void => {
    document.addEventListener('click', this.handleClick, true);
    this.overrideWindowOpen();
  };

  private overrideWindowOpen = (): void => {
    const originalOpen = window.open.bind(window);
    window.open = (url?: string | URL, _target?: string, _features?: string): WindowProxy | null => {
      if (!this.store.getState().enabled) {
        return originalOpen(url, _target, _features);
      }
      if (url && !String(url).startsWith('javascript:')) {
        window.location.href = String(url);
      }
      return null;
    };
  };

  handleClick = (e: MouseEvent): void => {
    if (!this.store.getState().enabled) return;

    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (!(link instanceof HTMLAnchorElement)) return;
    if (!link.hasAttribute('href')) return;

    if (e.ctrlKey || e.metaKey) return;
    if (link.href.startsWith('javascript:')) return;

    e.stopImmediatePropagation();
    e.preventDefault();
    window.location.href = link.href;
  };
}
