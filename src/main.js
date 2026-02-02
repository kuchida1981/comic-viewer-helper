import { Store } from './store.js';
import { DefaultAdapter } from './adapters/DefaultAdapter.js';
import { Navigator } from './managers/Navigator.js';
import { UIManager } from './managers/UIManager.js';
import { InputManager } from './managers/InputManager.js';

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

    this.init = this.init.bind(this);
  }

  init() {
    const container = this.adapter.getContainer();
    if (!container) return;

    // Extract and set metadata
    const metadata = this.adapter.getMetadata 
      ? this.adapter.getMetadata() 
      : { title: 'Unknown Title', tags: [], relatedWorks: [] };
    this.store.setState({ metadata });

    // Initialize managers
    this.navigator.init();
    this.uiManager.init();
    this.inputManager.init();
  }
}

const app = new App();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', app.init);
} else {
  app.init();
}
