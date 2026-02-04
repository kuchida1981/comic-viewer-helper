import { Store } from '../store';

export class PopUnderBlocker {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
    this.handleClick = this.handleClick.bind(this);
  }

  init(): void {
    document.addEventListener('click', this.handleClick, true);
  }

  handleClick(e: MouseEvent): void {
    if (!this.store.getState().enabled) return;

    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (!(link instanceof HTMLAnchorElement)) return;
    if (!link.hasAttribute('href')) return;

    if (e.ctrlKey || e.metaKey) return;
    if (link.href.startsWith('javascript:')) return;

    const isOwnLink = link.className.includes('comic-helper-');
    if (link.target === '_blank' && !isOwnLink) return;

    e.stopImmediatePropagation();
    e.preventDefault();
    window.location.href = link.href;
  }
}
