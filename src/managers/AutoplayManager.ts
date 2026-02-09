import { Store, StoreState } from '../store';
import { Navigator } from './Navigator';
import { jumpToRandomWork } from '../logic';

export class AutoplayManager {
  private store: Store;
  private navigator: Navigator;
  private timerId: number | null = null;
  private readonly interval = 5000;

  constructor(store: Store, navigator: Navigator) {
    this.store = store;
    this.navigator = navigator;
  }

  init(): void {
    this.store.subscribe((state: StoreState) => {
      if (state.enabled && state.isAutoplayEnabled && !this.timerId) {
        this.start();
      } else if ((!state.enabled || !state.isAutoplayEnabled) && this.timerId) {
        this.stop();
      }
    });

    const state = this.store.getState();
    if (state.enabled && state.isAutoplayEnabled) {
      this.start();
    }
  }

  start(): void {
    if (this.timerId) return;
    console.log('[AutoplayManager] Starting autoplay');
    this.scheduleNext();
  }

  stop(): void {
    if (this.timerId) {
      console.log('[AutoplayManager] Stopping autoplay');
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNext(): void {
    this.timerId = window.setTimeout(async () => {
      await this.next();
      if (this.timerId && this.store.getState().isAutoplayEnabled) {
        this.scheduleNext();
      }
    }, this.interval);
  }

  private async next(): Promise<void> {
    const state = this.store.getState();
    const imgs = this.navigator.getImages();
    if (imgs.length === 0) return;

    const currentIndex = state.currentVisibleIndex;
    const isDualView = state.isDualViewEnabled;
    
    // Determine the next target index to see if we've reached the end
    // This logic mimics Navigator.scrollToImage's step calculation
    let step = 1;
    if (isDualView && currentIndex !== -1) {
      const currentImg = imgs[currentIndex];
      const prospectiveTargetIndex = currentIndex + 1;
      if (prospectiveTargetIndex < imgs.length) {
        const prospectiveTargetImg = imgs[prospectiveTargetIndex];
        if (currentImg && prospectiveTargetImg && prospectiveTargetImg.parentElement === currentImg.parentElement && prospectiveTargetImg.parentElement?.classList.contains('comic-row-wrapper')) {
          step = 2;
        }
      }
    }

    if (currentIndex + step >= imgs.length) {
       console.log('[AutoplayManager] Reached end of work. Jumping to random work.');
       this.stop();
       this.store.setState({ isAutoplayEnabled: true }); // Ensure it stays enabled for the next work
       jumpToRandomWork(state.metadata, state.searchCache);
       return;
    }

    console.log('[AutoplayManager] Moving to next page');
    await this.navigator.scrollToImage(1);
  }
}
