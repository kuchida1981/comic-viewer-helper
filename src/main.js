import { Store } from './store.js';
import { DefaultAdapter } from './adapters/DefaultAdapter.js';
import { Navigator } from './managers/Navigator.js';
import { UIManager } from './managers/UIManager.js';
import { InputManager } from './managers/InputManager.js';
import { ResumeManager } from './managers/ResumeManager.js';

class App {
  constructor() {
    this.store = new Store();
    
    // Select adapter (currently only DefaultAdapter)
    /** @type {import('./global').SiteAdapter[]} */
    const adapters = [DefaultAdapter];
    this.adapter = adapters.find(a => a.match(window.location.href)) || DefaultAdapter;

    this.navigator = new Navigator(this.adapter, this.store);
    this.uiManager = new UIManager(this.adapter, this.store, this.navigator);
    this.inputManager = new InputManager(this.store, this.navigator);
    this.resumeManager = new ResumeManager(this.store);

    this.init = this.init.bind(this);
  }

  init() {
    const container = this.adapter.getContainer();
    if (!container) return;

    // Extract and set metadata
    const metadata = this.adapter.getMetadata?.() ?? { title: 'Unknown Title', tags: [], relatedWorks: [] };
    this.store.setState({ metadata });

    // Initialize managers
    this.navigator.init();
    this.uiManager.init();
    this.inputManager.init();

    // Resume position logic
    console.log('[Resume] Checking resume...');
    console.log('[Resume] isEnabled:', this.resumeManager.isEnabled());
    if (this.resumeManager.isEnabled()) {
      const workKey = window.location.origin + window.location.pathname;
      console.log('[Resume] workKey:', workKey);
      const savedIndex = this.resumeManager.loadPosition(workKey);
      console.log('[Resume] savedIndex:', savedIndex);
      // 1ページ目以外の場合のみ通知を表示
      if (savedIndex !== null && savedIndex > 0) {
        console.log('[Resume] Showing notification...');
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
  }
}

const app = new App();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app.init);
} else {
  app.init();
}
