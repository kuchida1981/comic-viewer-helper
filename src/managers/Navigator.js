import { fitImagesToViewport, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, waitForImageLoad, preloadImages, forceImageLoad } from '../logic.js';

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

    /** @type {number | null} */
    this.pendingTargetIndex = null;
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
          // If we are explicitly navigating to a target, ignore automatic layout updates
          // triggered by image loads, as jumpToPage/scrollToImage will handle it.
          if (this.pendingTargetIndex !== null) {
            console.log('[Navigator] Skipping auto applyLayout because navigation is pending');
            return;
          }
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
      preloadImages(imgs, currentIndex);
    }
  }

  /**
   * @param {string | number} pageNumber 
   * @returns {Promise<boolean>}
   */
  async jumpToPage(pageNumber) {
    const imgs = this.getImages();
    const index = typeof pageNumber === 'string' ? parseInt(pageNumber, 10) - 1 : pageNumber - 1;
    const targetImg = getImageElementByIndex(imgs, index);

    console.log(`[Navigator] jumpToPage: ${pageNumber} (index: ${index})`, { complete: targetImg?.complete, height: targetImg?.naturalHeight });

    if (targetImg) {
      this.pendingTargetIndex = index;
      forceImageLoad(targetImg);
      
      if (!targetImg.complete || targetImg.naturalHeight === 0) {
        console.log(`[Navigator] Waiting for image load...`);
        this.store.setState({ isLoading: true });
        await waitForImageLoad(targetImg);
        console.log(`[Navigator] Image loaded. Applying layout...`);
        this.applyLayout(index);
        this.store.setState({ isLoading: false });
      } else {
        this.applyLayout(index);
      }

      requestAnimationFrame(() => {
        this.pendingTargetIndex = null;
      });
      return true;
    } else {
      this.updatePageCounter();
      return false;
    }
  }

  /**
   * @param {number} direction 
   * @returns {Promise<void>}
   */
  async scrollToImage(direction) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;

    const { isDualViewEnabled } = this.store.getState();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    let targetIndex = currentIndex + direction;

    if (targetIndex < 0) targetIndex = 0;

    if (isDualViewEnabled && direction !== 0 && currentIndex !== -1) {
      const currentImg = imgs[currentIndex];
      if (targetIndex < imgs.length) {
        const prospectiveTargetImg = imgs[targetIndex];
        if (currentImg && prospectiveTargetImg && prospectiveTargetImg.parentElement === currentImg.parentElement && prospectiveTargetImg.parentElement?.classList.contains('comic-row-wrapper')) {
          targetIndex += direction;
        }
      }
    }

    if (targetIndex >= imgs.length) {
      if (direction > 0 && !this.store.getState().isMetadataModalOpen) {
        this.store.setState({ isMetadataModalOpen: true });
      }
      return;
    }

    console.log(`[Navigator] scrollToImage: ${direction} (target: ${targetIndex})`);

    const finalIndex = Math.max(0, Math.min(targetIndex, imgs.length - 1));
    const finalTarget = imgs[finalIndex];
    if (finalTarget) {
      this.pendingTargetIndex = finalIndex;
      forceImageLoad(finalTarget);
      
      if (!finalTarget.complete || finalTarget.naturalHeight === 0) {
        console.log(`[Navigator] Waiting for image load...`);
        this.store.setState({ isLoading: true });
        await waitForImageLoad(finalTarget);
        this.applyLayout(finalIndex);
        this.store.setState({ isLoading: false });
      } else {
        finalTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      requestAnimationFrame(() => {
        this.pendingTargetIndex = null;
      });
    }
  }

  /**
   * @param {'start' | 'end'} position
   * @returns {Promise<void>}
   */
  async scrollToEdge(position) {
    const imgs = this.getImages();
    if (imgs.length === 0) return;
    const targetIndex = position === 'start' ? 0 : imgs.length - 1;
    const target = imgs[targetIndex];

    this.pendingTargetIndex = targetIndex;
    forceImageLoad(target);

    if (!target.complete || target.naturalHeight === 0) {
      this.store.setState({ isLoading: true });
      await waitForImageLoad(target);
      this.store.setState({ isLoading: false });
    }

    this.applyLayout(targetIndex);
    // applyLayout は RAF 内で scrollIntoView を実行する。
    // ガードを RAF と同じフレームで解除することで、スクロール実行前の画像ロード
    // イベントによる割り込み applyLayout を防止する。
    requestAnimationFrame(() => {
      this.pendingTargetIndex = null;
    });
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
    const viewportIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    const currentIndex = (this.pendingTargetIndex !== null)
      ? this.pendingTargetIndex
      : (forcedIndex !== undefined ? forcedIndex : viewportIndex);

    console.log(`[Navigator] applyLayout: current=${currentIndex}, pending=${this.pendingTargetIndex}, forced=${forcedIndex}, viewport=${viewportIndex}`);

    fitImagesToViewport(container, spreadOffset, isDualViewEnabled);
    this.updatePageCounter();

    if (currentIndex !== -1) {
      const targetImg = imgs[currentIndex];
      if (targetImg) {
        // DOM update might take a moment to be reflected in layout.
        // Wait for next frame before scrolling.
        requestAnimationFrame(() => {
          console.log(`[Navigator] Executing scrollIntoView for index ${currentIndex}`);
          targetImg.scrollIntoView({ block: 'center' });
        });
        preloadImages(imgs, currentIndex);
      }
    }
  }
}

