import { Metadata, SearchResultsState, SearchCache } from './types';

export const STORAGE_KEYS = {
  DUAL_VIEW: 'comic-viewer-helper-dual-view',
  GUI_POS: 'comic-viewer-helper-gui-pos',
  ENABLED: 'comic-viewer-helper-enabled',
  SEARCH_QUERY: 'comic-viewer-helper-search-query',
  SEARCH_CACHE: 'comic-viewer-helper-search-cache'
} as const;

export interface GuiPos {
  top: number;
  left: number;
}

export interface StoreState {
  enabled: boolean;
  isDualViewEnabled: boolean;
  spreadOffset: number;
  currentVisibleIndex: number;
  guiPos: GuiPos | null;
  metadata: Metadata;
  isMetadataModalOpen: boolean;
  isHelpModalOpen: boolean;
  isSearchModalOpen: boolean;
  isLoading: boolean;
  searchResults: SearchResultsState | null;
  searchQuery: string;
  searchCache: SearchCache | null;
}

export type StoreListener = (state: StoreState) => void;

export class Store {
  private state: StoreState;
  private listeners: StoreListener[];

  constructor() {
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
      isHelpModalOpen: false,
      isSearchModalOpen: false,
      isLoading: false,
      searchResults: null,
      searchQuery: this._loadSearchQuery(),
      searchCache: this._loadSearchCache()
    };
    this.listeners = [];
  }

  getState(): StoreState {
    return { ...this.state };
  }

  setState(patch: Partial<StoreState>): void {
    let changed = false;
    for (const key of Object.keys(patch) as (keyof StoreState)[]) {
      if (this.state[key] !== patch[key]) {
        this._applyPatch(key, patch[key]!);
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

    const host = window.location.hostname;
    if ('searchQuery' in patch) {
      localStorage.setItem(`${STORAGE_KEYS.SEARCH_QUERY}-${host}`, patch.searchQuery!);
    }
    if ('searchCache' in patch) {
      try {
        localStorage.setItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`, JSON.stringify(patch.searchCache));
      } catch (e) {
        console.warn('Failed to save search cache to localStorage:', e);
      }
    }

    this._notify();
  }

  subscribe(callback: StoreListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private _notify(): void {
    this.listeners.forEach(callback => callback(this.getState()));
  }

  private _applyPatch<K extends keyof StoreState>(key: K, value: StoreState[K]): void {
    this.state[key] = value;
  }

  private _loadSearchCache(): SearchCache | null {
    try {
      const host = window.location.hostname;
      const saved = localStorage.getItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private _loadSearchQuery(): string {
    const host = window.location.hostname;
    return localStorage.getItem(`${STORAGE_KEYS.SEARCH_QUERY}-${host}`) || '';
  }

  private _loadGuiPos(): GuiPos | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUI_POS);
      if (!saved) return null;
      const pos = JSON.parse(saved);
      // Basic validation
      const buffer = 50;
      if (
        typeof pos.left !== 'number' ||
        typeof pos.top !== 'number' ||
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
