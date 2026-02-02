import { fitImagesToViewport, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal } from '../logic.js';

export class Navigator {
  /**
   * @param {import('../global').SiteAdapter} adapter 
   * @param {import('../store.js').Store} store 
   */
  constructor(adapter, store) {
    this.adapter = adapter;
    this.store = store;
    /** @type {HTMLImageElement[]} */
    this.originalImages = [];

    this.getImages = this.getImages.bind(this);
    this.jumpToPage = this.jumpToPage.bind(this);
    this.scrollToImage = this.scrollToImage.bind(this);
    this.scrollToEdge = this.scrollToEdge.bind(this);
    this.applyLayout = this.applyLayout.bind(this);
    this.updatePageCounter = this.updatePageCounter.bind(this);
    this.init = this.init.bind(this);

    // Track last state for layout updates
    this._lastEnabled = undefined;
    this._lastDualView = undefined;
    this._lastSpreadOffset = undefined;
  }

  init() {
    this.store.subscribe((/** @type {any} */ state) => {
      const layoutChanged = 
        state.enabled !== this._lastEnabled ||
        state.isDualViewEnabled !== this._lastDualView ||
        state.spreadOffset !== this._lastSpreadOffset;

      if (layoutChanged) {
        this.applyLayout();
        this._lastEnabled = state.enabled;
        this._lastDualView = state.isDualViewEnabled;
        this._lastSpreadOffset = state.spreadOffset;
      }
    });

    const initialState = this.store.getState();
    this._lastEnabled = initialState.enabled;
    this._lastDualView = initialState.isDualViewEnabled;
    this._lastSpreadOffset = initialState.spreadOffset;

    const imgs = this.getImages();
    imgs.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', () => {
          requestAnimationFrame(() => this.applyLayout());
        });
      }
    });

    if (initialState.enabled) {
      this.applyLayout();
    }
  }

  /**
   * @returns {HTMLImageElement[]}
   */
  getImages() {
    if (this.originalImages.length > 0) return this.originalImages;
    this.originalImages = this.adapter.getImages();
    return this.originalImages;
  }

  updatePageCounter() {
    const state = this.store.getState();
    const { enabled } = state;
    if (!enabled) return;

    const imgs = this.getImages();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    if (currentIndex !== -1) {
      this.store.setState({ currentVisibleIndex: currentIndex });
    }
  }

  /**
   * @param {string | number} pageNumber 
   * @returns {boolean}
   */
  jumpToPage(pageNumber) {
    const imgs = this.getImages();
    const index = typeof pageNumber === 'string' ? parseInt(pageNumber, 10) - 1 : pageNumber - 1;
    const targetImg = getImageElementByIndex(imgs, index);

    if (targetImg) {
      targetImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    } else {
      this.updatePageCounter();
      return false;
    }
  }

  /**
   * @param {number} direction 
   */
  scrollToImage(direction) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;

    const { isDualViewEnabled } = this.store.getState();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    let targetIndex = currentIndex + direction;

    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= imgs.length) targetIndex = imgs.length - 1;

    const prospectiveTargetImg = imgs[targetIndex];

    if (isDualViewEnabled && direction !== 0 && currentIndex !== -1) {
      const currentImg = imgs[currentIndex];
      if (currentImg && prospectiveTargetImg && prospectiveTargetImg.parentElement === currentImg.parentElement && prospectiveTargetImg.parentElement?.classList.contains('comic-row-wrapper')) {
        targetIndex += direction;
      }
    }

    const finalIndex = Math.max(0, Math.min(targetIndex, imgs.length - 1));
    const finalTarget = imgs[finalIndex];
    if (finalTarget) {
      finalTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * @param {'start' | 'end'} position 
   */
  scrollToEdge(position) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;
    const target = position === 'start' ? imgs[0] : imgs[imgs.length - 1];
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * @param {number} [forcedIndex] 
   */
  applyLayout(forcedIndex) {
    const { enabled, isDualViewEnabled, spreadOffset } = this.store.getState();
    const container = this.adapter.getContainer();
    if (!container) return;
    
    // If disabled, we might want to revert.
    if (!enabled) {
      revertToOriginal(this.getImages(), container);
      return;
    }

    const imgs = this.getImages();
    const currentIndex = forcedIndex !== undefined ? forcedIndex : getPrimaryVisibleImageIndex(imgs, window.innerHeight);

    fitImagesToViewport(container, spreadOffset, isDualViewEnabled);
    this.updatePageCounter();

    if (currentIndex !== -1) {
      const targetImg = imgs[currentIndex];
      if (targetImg) targetImg.scrollIntoView({ block: 'center' });
    }
  }
}
