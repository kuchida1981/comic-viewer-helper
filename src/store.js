export const STORAGE_KEYS = {
  DUAL_VIEW: 'comic-viewer-helper-dual-view',
  GUI_POS: 'comic-viewer-helper-gui-pos',
  ENABLED: 'comic-viewer-helper-enabled'
};

/**
 * @typedef {Object} Metadata
 * @property {string} title
 * @property {Array<{text: string, href: string, type: string | null}>} tags
 * @property {Array<{title: string, href: string, thumb: string}>} relatedWorks
 */

/**
 * @typedef {Object} StoreState
 * @property {boolean} enabled
 * @property {boolean} isDualViewEnabled
 * @property {number} spreadOffset
 * @property {number} currentVisibleIndex
 * @property {{top: number, left: number} | null} guiPos
 * @property {Metadata} metadata
 * @property {boolean} isMetadataModalOpen
 * @property {boolean} isHelpModalOpen
 */

export class Store {
  constructor() {
    /** @type {StoreState} */
    this.state = {
      enabled: localStorage.getItem(STORAGE_KEYS.ENABLED) !== 'false',
      isDualViewEnabled: localStorage.getItem(STORAGE_KEYS.DUAL_VIEW) === 'true',
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: this._loadGuiPos(),
      metadata: {
        title: '',
        tags: [],
        relatedWorks: []
      },
      isMetadataModalOpen: false,
      isHelpModalOpen: false
    };
    /** @type {Function[]} */
    this.listeners = [];
  }

  /**
   * @returns {StoreState}
   */
  getState() {
    return { ...this.state };
  }

  /**
   * @param {Partial<StoreState>} patch 
   */
  setState(patch) {
    let changed = false;
    for (const key in patch) {
      const k = /** @type {keyof StoreState} */ (key);
      if (this.state[k] !== patch[k]) {
        // @ts-ignore - dynamic key access
        this.state[k] = patch[k];
        changed = true;
      }
    }

    if (!changed) return;

    // Persistence
    if ('enabled' in patch) {
      localStorage.setItem(STORAGE_KEYS.ENABLED, String(patch.enabled));
    }
    if ('isDualViewEnabled' in patch) {
      localStorage.setItem(STORAGE_KEYS.DUAL_VIEW, String(patch.isDualViewEnabled));
    }
    if ('guiPos' in patch) {
      localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify(patch.guiPos));
    }

    this._notify();
  }

  /**
   * @param {Function} callback 
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  _notify() {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  _loadGuiPos() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUI_POS);
      if (!saved) return null;
      const pos = JSON.parse(saved);
      // Basic validation (copied from main.js)
      const buffer = 50;
      if (
        pos.left < -buffer || 
        pos.left > window.innerWidth + buffer || 
        pos.top < -buffer || 
        pos.top > window.innerHeight + buffer
      ) {
        return null;
      }
      return pos;
    } catch {
      return null;
    }
  }
}
