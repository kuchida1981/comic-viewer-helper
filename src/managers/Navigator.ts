import { fitImagesToViewport, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, waitForImageLoad, preloadImages, forceImageLoad } from '../logic';
import { SiteAdapter } from '../types';
import { Store, StoreState } from '../store';

export class Navigator {
  private adapter: SiteAdapter;
  private store: Store;
  private originalImages: HTMLImageElement[];
  private _lastEnabled?: boolean;
  private _lastDualView?: boolean;
  private _lastSpreadOffset?: number;
  private pendingTargetIndex: number | null;

  constructor(adapter: SiteAdapter, store: Store) {
    this.adapter = adapter;
    this.store = store;
    this.originalImages = [];

    this.getImages = this.getImages.bind(this);
    this.jumpToPage = this.jumpToPage.bind(this);
    this.scrollToImage = this.scrollToImage.bind(this);
    this.scrollToEdge = this.scrollToEdge.bind(this);
    this.applyLayout = this.applyLayout.bind(this);
    this.updatePageCounter = this.updatePageCounter.bind(this);
    this.init = this.init.bind(this);

    this._lastEnabled = undefined;
    this._lastDualView = undefined;
    this._lastSpreadOffset = undefined;

    this.pendingTargetIndex = null;
  }

  init(): void {
    this.store.subscribe((state: StoreState) => {
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
          if (this.pendingTargetIndex !== null) return;
          requestAnimationFrame(() => this.applyLayout());
        });
      }
    });

    if (initialState.enabled) {
      this.applyLayout();
    }
  }

  getImages(): HTMLImageElement[] {
    if (this.originalImages.length > 0) return this.originalImages;
    this.originalImages = this.adapter.getImages();
    return this.originalImages;
  }

  updatePageCounter(): void {
    const state = this.store.getState();
    if (!state.enabled) return;

    const imgs = this.getImages();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    if (currentIndex !== -1) {
      this.store.setState({ currentVisibleIndex: currentIndex });
      preloadImages(imgs, currentIndex);
    }
  }

  async jumpToPage(pageNumber: string | number): Promise<boolean> {
    const imgs = this.getImages();
    const index = typeof pageNumber === 'string' ? parseInt(pageNumber, 10) - 1 : pageNumber - 1;
    const targetImg = getImageElementByIndex(imgs, index);

    if (targetImg) {
      this.pendingTargetIndex = index;
      forceImageLoad(targetImg);

      if (!targetImg.complete || targetImg.naturalHeight === 0) {
        this.store.setState({ isLoading: true });
        await waitForImageLoad(targetImg);
        this.applyLayout(index);
        this.store.setState({ isLoading: false });
      } else {
        this.applyLayout(index);
      }

      requestAnimationFrame(() => { this.pendingTargetIndex = null; });
      return true;
    }
    this.updatePageCounter();
    return false;
  }

  private _calculateTargetIndex(imgs: HTMLImageElement[], direction: number): number {
    const { isDualViewEnabled } = this.store.getState();
    const currentIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    let targetIndex = currentIndex + direction;

    if (targetIndex < 0) return 0;

    if (isDualViewEnabled && direction !== 0 && currentIndex !== -1) {
      const currentImg = imgs[currentIndex];
      const prospective = imgs[targetIndex];
      if (currentImg && prospective && prospective.parentElement === currentImg.parentElement && 
          prospective.parentElement?.classList.contains('comic-row-wrapper')) {
        targetIndex += direction;
      }
    }
    return targetIndex;
  }

  async scrollToImage(direction: number): Promise<void> {
    const imgs = this.getImages();
    if (imgs.length === 0) return;

    const targetIndex = this._calculateTargetIndex(imgs, direction);

    if (targetIndex >= imgs.length) {
      if (direction > 0 && !this.store.getState().isMetadataModalOpen) {
        this.store.setState({ isMetadataModalOpen: true });
      }
      return;
    }

    const finalIndex = Math.max(0, Math.min(targetIndex, imgs.length - 1));
    await this._performScrollToImage(imgs[finalIndex], finalIndex);
  }

  private async _performScrollToImage(target: HTMLImageElement, index: number): Promise<void> {
    this.pendingTargetIndex = index;
    forceImageLoad(target);

    if (!target.complete || target.naturalHeight === 0) {
      this.store.setState({ isLoading: true });
      await waitForImageLoad(target);
      this.applyLayout(index);
      this.store.setState({ isLoading: false });
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    requestAnimationFrame(() => { this.pendingTargetIndex = null; });
  }

  async scrollToEdge(position: 'start' | 'end'): Promise<void> {
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
    requestAnimationFrame(() => { this.pendingTargetIndex = null; });
  }

  applyLayout(forcedIndex?: number): void {
    const { enabled, isDualViewEnabled, spreadOffset } = this.store.getState();
    const container = this.adapter.getContainer();
    if (!container) return;

    if (!enabled) {
      revertToOriginal(this.getImages(), container);
      return;
    }

    const imgs = this.getImages();
    const viewportIndex = getPrimaryVisibleImageIndex(imgs, window.innerHeight);
    const currentIndex = (this.pendingTargetIndex !== null)
      ? this.pendingTargetIndex
      : (forcedIndex !== undefined ? forcedIndex : viewportIndex);

    fitImagesToViewport(container, spreadOffset, isDualViewEnabled);

    if (currentIndex !== -1) {
      const targetImg = imgs[currentIndex];
      if (targetImg) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            targetImg.scrollIntoView({ block: 'center' });
          });
        });
        preloadImages(imgs, currentIndex);
      }
    }
  }
}