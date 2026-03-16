import { Store } from './store';
import { DefaultAdapter } from './adapters/DefaultAdapter';
import { Navigator } from './managers/Navigator';
import { DiscoveryManager } from './managers/DiscoveryManager';
import { UIManager } from './managers/UIManager';
import { InputManager } from './managers/InputManager';
import { ResumeManager } from './managers/ResumeManager';
import { PopUnderBlocker } from './managers/PopUnderBlocker';
import { SiteAdapter, isMetadataAdapter } from './types';

class App {
  private store: Store;
  private adapter: SiteAdapter;
  private navigator: Navigator;
  private discoveryManager: DiscoveryManager;
  private uiManager: UIManager;
  private inputManager: InputManager;
  private resumeManager: ResumeManager;
  private popUnderBlocker: PopUnderBlocker;

  constructor() {
    this.store = new Store();

    // Select adapter (currently only DefaultAdapter)
    const adapters: SiteAdapter[] = [DefaultAdapter];
    this.adapter = adapters.find(a => a.match(window.location.href)) || DefaultAdapter;

    this.navigator = new Navigator(this.adapter, this.store);
    this.discoveryManager = new DiscoveryManager(this.adapter, this.store);
    this.uiManager = new UIManager(this.adapter, this.store, this.navigator, this.discoveryManager);
    this.inputManager = new InputManager(this.store, this.navigator, this.discoveryManager, this.uiManager);
    this.resumeManager = new ResumeManager(this.store);
    this.popUnderBlocker = new PopUnderBlocker(this.store);
  }

  init = (): void => {
    this.popUnderBlocker.init();

    const container = this.adapter.getContainer();
    if (!container) return;

    // Extract and set metadata
    const metadata = isMetadataAdapter(this.adapter)
      ? this.adapter.getMetadata()
      : { title: 'Unknown Title', tags: [], relatedWorks: [] };
    this.store.setState({ metadata });

    // Initialize managers
    this.navigator.init();
    this.uiManager.init();
    this.inputManager.init();

    // Add current work to lucky history with detailed info
    const firstImageSrc = this.navigator.getImages()[0]?.src || '';
    this.store.addLuckyHistory({
      title: metadata.title || document.title,
      href: window.location.href,
      thumb: firstImageSrc
    });

    // Resume position logic
    if (this.resumeManager.isEnabled()) {
      const workKey = window.location.origin + window.location.pathname;
      const savedIndex = this.resumeManager.loadPosition(workKey);
      // 1ページ目以外の場合のみ通知を表示
      if (savedIndex !== null && savedIndex > 0) {
        this.uiManager.showResumeNotification(savedIndex);
      }
    }

    // Save position on page unload
    window.addEventListener('beforeunload', () => {
      if (this.resumeManager.isEnabled()) {
        const workKey = window.location.origin + window.location.pathname;
        const currentIndex = this.store.getState().currentVisibleIndex;
        this.resumeManager.savePosition(workKey, currentIndex);
      }
    });
  };
}

const app = new App();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app.init);
} else {
  app.init();
}
