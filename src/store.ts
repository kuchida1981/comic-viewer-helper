import { Metadata, SearchResultsState, SearchCache, SearchContext, RelatedWork } from './types';
import { isGuiPos, isStringArray, isSearchCache, isSearchContext, isRelatedWorkArray } from './type-guards';
import { normalizeUrl } from './logic';

export const STORAGE_KEYS = {
  DUAL_VIEW: 'comic-viewer-helper-dual-view',
  GUI_POS: 'comic-viewer-helper-gui-pos',
  ENABLED: 'comic-viewer-helper-enabled',
  SEARCH_QUERY: 'comic-viewer-helper-search-query',
  SEARCH_CONTEXT: 'comic-viewer-helper-search-context',
  SEARCH_CACHE: 'comic-viewer-helper-search-cache',
  SEARCH_HISTORY: 'comic-viewer-helper-search-history',
  FAVORITES: 'comic-viewer-helper-favorites',
  AUTOPLAY_ENABLED: 'comic-viewer-helper-autoplay-enabled',
  AUTOPLAY_INTERVAL: 'comic-viewer-helper-autoplay-interval',
  LUCKY_HISTORY: 'comic-viewer-helper-lucky-history'
} as const;

export const MAX_SEARCH_HISTORY = 3;
export const MAX_LUCKY_HISTORY = 20;

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
  isFavoritesModalOpen: boolean;
  isLoading: boolean;
  isLuckyLoading: boolean;
  searchResults: SearchResultsState | null;
  searchQuery: string;
  searchContext?: SearchContext;
  searchCache: SearchCache | null;
  searchHistory: string[];
  luckyHistory: string[];
  favorites: RelatedWork[];
  isAutoplayEnabled: boolean;
  autoplayInterval: number;
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
      isFavoritesModalOpen: false,
      isLoading: false,
      isLuckyLoading: false,
      searchResults: null,
      searchQuery: this._loadSearchQuery(),
      searchContext: this._loadSearchContext(),
      searchCache: this._loadSearchCache(),
      searchHistory: this._loadSearchHistory(),
      luckyHistory: this._loadLuckyHistory(),
      favorites: this._loadFavorites(),
      isAutoplayEnabled: localStorage.getItem(STORAGE_KEYS.AUTOPLAY_ENABLED) === 'true',
      autoplayInterval: parseInt(localStorage.getItem(STORAGE_KEYS.AUTOPLAY_INTERVAL) || '5', 10)
    };
    this.listeners = [];
  }

  getState = (): StoreState => {
    return { ...this.state };
  };

  setState = (patch: Partial<StoreState>): void => {
    let changed = false;
    for (const key of Object.keys(patch) as (keyof StoreState)[]) {
      if (this.state[key] !== patch[key]) {
        this._applyPatch(key, patch[key]!);
        changed = true;
      }
    }

    if (changed) {
      this._persistChanges(patch);
      this._notify();
    }
  };

  private _persistChanges = (patch: Partial<StoreState>): void => {
    if ('enabled' in patch) localStorage.setItem(STORAGE_KEYS.ENABLED, String(patch.enabled));
    if ('isDualViewEnabled' in patch) localStorage.setItem(STORAGE_KEYS.DUAL_VIEW, String(patch.isDualViewEnabled));
    if ('guiPos' in patch) localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify(patch.guiPos));
    if ('isAutoplayEnabled' in patch) localStorage.setItem(STORAGE_KEYS.AUTOPLAY_ENABLED, String(patch.isAutoplayEnabled));
    if ('autoplayInterval' in patch) localStorage.setItem(STORAGE_KEYS.AUTOPLAY_INTERVAL, String(patch.autoplayInterval));

    this._persistSearchRelatedChanges(patch);
    this._persistLuckyHistory(patch);
  };

  private _persistSearchRelatedChanges = (patch: Partial<StoreState>): void => {
    const host = window.location.hostname;
    if ('searchQuery' in patch) {
      localStorage.setItem(`${STORAGE_KEYS.SEARCH_QUERY}-${host}`, patch.searchQuery!);
    }
    if ('searchContext' in patch) {
      const key = `${STORAGE_KEYS.SEARCH_CONTEXT}-${host}`;
      if (patch.searchContext) {
        localStorage.setItem(key, JSON.stringify(patch.searchContext));
      } else {
        localStorage.removeItem(key);
      }
    }
    if ('searchCache' in patch) {
      try {
        localStorage.setItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`, JSON.stringify(patch.searchCache));
      } catch (e) {
        console.warn('Failed to save search cache to localStorage:', e);
      }
    }
    if ('searchHistory' in patch) {
      localStorage.setItem(`${STORAGE_KEYS.SEARCH_HISTORY}-${host}`, JSON.stringify(patch.searchHistory));
    }
    if ('favorites' in patch) {
      localStorage.setItem(`${STORAGE_KEYS.FAVORITES}-${host}`, JSON.stringify(patch.favorites));
    }
  };

  private _persistLuckyHistory = (patch: Partial<StoreState>): void => {
    if ('luckyHistory' in patch) {
      const host = window.location.hostname;
      localStorage.setItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${host}`, JSON.stringify(patch.luckyHistory));
    }
  };

  subscribe = (callback: StoreListener): () => void => {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  };

  private _notify = (): void => {
    this.listeners.forEach(callback => callback(this.getState()));
  };

  private _applyPatch = <K extends keyof StoreState>(key: K, value: StoreState[K]): void => {
    this.state[key] = value;
  };

  addLuckyHistory = (url: string): void => {
    const normalizedUrl = normalizeUrl(url);
    const newHistory = Array.from(new Set([
      normalizedUrl,
      ...this.state.luckyHistory.map(normalizeUrl)
    ])).slice(0, MAX_LUCKY_HISTORY);
    this.setState({ luckyHistory: newHistory });
  };

  private _loadSearchHistory = (): string[] => {
    try {
      const host = window.location.hostname;
      const saved = localStorage.getItem(`${STORAGE_KEYS.SEARCH_HISTORY}-${host}`);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isStringArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  };

  private _loadLuckyHistory = (): string[] => {
    try {
      const host = window.location.hostname;
      const saved = localStorage.getItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${host}`);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isStringArray(parsed)) {
          return parsed;
        }
      }
      return [];
    } catch {
      return [];
    }
  };

  private _loadSearchCache = (): SearchCache | null => {
    try {
      const host = window.location.hostname;
      const saved = localStorage.getItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`);
      if (!saved) return null;
      const parsed: unknown = JSON.parse(saved);
      return isSearchCache(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  private _loadSearchQuery = (): string => {
    const host = window.location.hostname;
    return localStorage.getItem(`${STORAGE_KEYS.SEARCH_QUERY}-${host}`) || '';
  };

  private _loadSearchContext = (): SearchContext | undefined => {
    try {
      const host = window.location.hostname;
      const saved = localStorage.getItem(`${STORAGE_KEYS.SEARCH_CONTEXT}-${host}`);
      if (!saved) return undefined;
      const parsed: unknown = JSON.parse(saved);
      return isSearchContext(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  };

  private _loadFavorites = (): RelatedWork[] => {
    try {
      const host = window.location.hostname;
      const saved = localStorage.getItem(`${STORAGE_KEYS.FAVORITES}-${host}`);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      return isRelatedWorkArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  private _loadGuiPos = (): GuiPos | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUI_POS);
      if (!saved) return null;
      const pos: unknown = JSON.parse(saved);
      // Basic validation
      if (!isGuiPos(pos)) return null;
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
  };
}