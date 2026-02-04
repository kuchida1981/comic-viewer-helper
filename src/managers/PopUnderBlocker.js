export class PopUnderBlocker {
  /**
   * @param {import('../store.js').Store} store
   */
  constructor(store) {
    this.store = store;
    this.handleClick = this.handleClick.bind(this);
  }

  init() {
    document.addEventListener('click', this.handleClick, true);
  }

  /**
   * @param {MouseEvent} e
   */
  handleClick(e) {
    if (!this.store.getState().enabled) return;

    const link = /** @type {HTMLElement} */ (e.target)?.closest?.('a');
    if (!(link instanceof HTMLAnchorElement)) return;

    if (e.ctrlKey || e.metaKey) return;
    if (link.target === '_blank') return;
    if (link.href.startsWith('javascript:')) return;

    e.stopImmediatePropagation();
    e.preventDefault();
    window.location.href = link.href;
  }
}
