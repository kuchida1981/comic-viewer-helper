import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store, STORAGE_KEYS } from './store.js';
import { setupLocalStorageMock } from './test/mocks/storage.js';

describe('Store', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with default values if localStorage is empty', () => {
    const store = new Store();
    expect(store.getState()).toEqual({
      enabled: true,
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: null,
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
      searchQuery: '',
      searchContext: undefined,
      searchCache: null,
      searchHistory: [],
      luckyHistory: [],
      favorites: [],
      isAutoplayEnabled: false,
      autoplayInterval: 5
    });
  });

  it('should load initial state from localStorage', () => {
    localStorage.setItem(STORAGE_KEYS.ENABLED, 'false');
    localStorage.setItem(STORAGE_KEYS.DUAL_VIEW, 'true');
    localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify({ top: 100, left: 200 }));
    localStorage.setItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${window.location.hostname}`, JSON.stringify(['url1', 'url2']));

    const store = new Store();
    const state = store.getState();
    expect(state.enabled).toBe(false);
    expect(state.isDualViewEnabled).toBe(true);
    expect(state.guiPos).toEqual({ top: 100, left: 200 });
    expect(state.luckyHistory).toEqual(['url1', 'url2']);
  });

  it('should update state and persist to localStorage', () => {
    const store = new Store();
    store.setState({ enabled: false, isDualViewEnabled: true, luckyHistory: ['new-url'] });

    expect(store.getState().enabled).toBe(false);
    expect(store.getState().isDualViewEnabled).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.ENABLED)).toBe('false');
    expect(localStorage.getItem(STORAGE_KEYS.DUAL_VIEW)).toBe('true');
    expect(JSON.parse(localStorage.getItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${window.location.hostname}`) || '[]')).toEqual(['new-url']);
  });

  it('addLuckyHistory should normalize and deduplicate URLs', () => {
    const store = new Store();
    const host = window.location.hostname;
    
    // Initial state
    store.setState({ luckyHistory: [`http://${host}/old?q=1`] });
    
    // Add same URL with different params
    store.addLuckyHistory(`http://${host}/old?q=2#hash`);
    
    // Should result in a single normalized URL
    expect(store.getState().luckyHistory).toEqual([`http://${host}/old`]);
    
    // Add another new URL
    store.addLuckyHistory(`http://${host}/new?param=val`);
    expect(store.getState().luckyHistory).toEqual([`http://${host}/new`, `http://${host}/old`]);
  });

  it('should persist search query and cache', () => {
    const store = new Store();
    const cache = {
      query: 'test',
      results: { results: [], totalCount: '0', nextPageUrl: null, pagination: [] },
      fetchedAt: Date.now()
    };
    store.setState({ searchQuery: 'test', searchCache: cache });

    const host = window.location.hostname;
    expect(localStorage.getItem(`${STORAGE_KEYS.SEARCH_QUERY}-${host}`)).toBe('test');
    expect(JSON.parse(localStorage.getItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`) || '{}')).toEqual(cache);
    
    const store2 = new Store();
    expect(store2.getState().searchQuery).toBe('test');
    expect(store2.getState().searchCache).toEqual(cache);
  });

  it('should persist search history', () => {
    const store = new Store();
    const history = ['a', 'b', 'c'];
    store.setState({ searchHistory: history });

    const host = window.location.hostname;
    expect(JSON.parse(localStorage.getItem(`${STORAGE_KEYS.SEARCH_HISTORY}-${host}`) || '[]')).toEqual(history);
    
    const store2 = new Store();
    expect(store2.getState().searchHistory).toEqual(history);
  });

  it('should persist favorites', () => {
    const store = new Store();
    const favorites = [{ title: 'Fave 1', href: 'url1', thumb: 'img1' }];
    store.setState({ favorites });

    const host = window.location.hostname;
    expect(JSON.parse(localStorage.getItem(`${STORAGE_KEYS.FAVORITES}-${host}`) || '[]')).toEqual(favorites);
    
    const store2 = new Store();
    expect(store2.getState().favorites).toEqual(favorites);
  });

  it('should notify subscribers on state change', () => {
    const store = new Store();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ enabled: false });

    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  });

  it('should not notify if state has not changed', () => {
    const store = new Store();
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ enabled: true }); // enabled is already true by default

    expect(listener).not.toHaveBeenCalled();
  });

  it('should validate guiPos on load', () => {
    localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify({ top: -1000, left: 200 }));
    const store = new Store();
    expect(store.getState().guiPos).toBeNull();
  });

  it('should unsubscribe correctly', () => {
    const store = new Store();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.setState({ enabled: false });

    expect(listener).not.toHaveBeenCalled();
  });

  it('should return null if guiPos JSON is invalid', () => {
    localStorage.setItem(STORAGE_KEYS.GUI_POS, 'invalid-json');
    const store = new Store();
    expect(store.getState().guiPos).toBeNull();
  });

  it('should handle partial state updates correctly', () => {
    const store = new Store();
    store.setState({ enabled: false });
    expect(store.getState().enabled).toBe(false);
    expect(store.getState().isDualViewEnabled).toBe(false); // remained default
  });

  it('should persist guiPos when updated', () => {
    const store = new Store();
    const pos = { top: 50, left: 50 };
    store.setState({ guiPos: pos });
    const saved = localStorage.getItem(STORAGE_KEYS.GUI_POS);
    expect(JSON.parse(saved || '{}')).toEqual(pos);
  });

  it('should handle invalid search history in localStorage', () => {
    const host = window.location.hostname;
    localStorage.setItem(`${STORAGE_KEYS.SEARCH_HISTORY}-${host}`, JSON.stringify(['a', 1, 'b']));
    const store = new Store();
    expect(store.getState().searchHistory).toEqual([]);
  });

  it('should handle invalid search cache in localStorage', () => {
    const host = window.location.hostname;
    localStorage.setItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`, JSON.stringify({ invalid: 'cache' }));
    const store = new Store();
    expect(store.getState().searchCache).toBeNull();
  });

  it('should handle invalid search context in localStorage', () => {
    const host = window.location.hostname;
    localStorage.setItem(`${STORAGE_KEYS.SEARCH_CONTEXT}-${host}`, JSON.stringify({ type: 'invalid' }));
    const store = new Store();
    expect(store.getState().searchContext).toBeUndefined();
  });

  it('should handle JSON parse errors during search related loads', () => {
    const host = window.location.hostname;
    localStorage.setItem(`${STORAGE_KEYS.SEARCH_HISTORY}-${host}`, 'invalid-json');
    localStorage.setItem(`${STORAGE_KEYS.SEARCH_CACHE}-${host}`, 'invalid-json');
    localStorage.setItem(`${STORAGE_KEYS.SEARCH_CONTEXT}-${host}`, 'invalid-json');
    const store = new Store();
    expect(store.getState().searchHistory).toEqual([]);
    expect(store.getState().searchCache).toBeNull();
    expect(store.getState().searchContext).toBeUndefined();
  });
});