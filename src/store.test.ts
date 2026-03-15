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
    const historyEntry = { title: 'Work 1', href: 'url1', thumb: '', viewCount: 1, firstViewedAt: 1000, lastViewedAt: 1000 };
    localStorage.setItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${window.location.hostname}`, JSON.stringify([historyEntry]));

    const store = new Store();
    const state = store.getState();
    expect(state.enabled).toBe(false);
    expect(state.isDualViewEnabled).toBe(true);
    expect(state.guiPos).toEqual({ top: 100, left: 200 });
    expect(state.luckyHistory).toEqual([historyEntry]);
  });

  it('should migrate old string[] luckyHistory to empty array', () => {
    localStorage.setItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${window.location.hostname}`, JSON.stringify(['url1', 'url2']));
    const store = new Store();
    expect(store.getState().luckyHistory).toEqual([]);
  });

  it('should update state and persist to localStorage', () => {
    const store = new Store();
    const histEntry = { title: 'New Work', href: 'new-url', thumb: '', viewCount: 1, firstViewedAt: 1000, lastViewedAt: 1000 };
    store.setState({ enabled: false, isDualViewEnabled: true, luckyHistory: [histEntry] });

    expect(store.getState().enabled).toBe(false);
    expect(store.getState().isDualViewEnabled).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.ENABLED)).toBe('false');
    expect(localStorage.getItem(STORAGE_KEYS.DUAL_VIEW)).toBe('true');
    expect(JSON.parse(localStorage.getItem(`${STORAGE_KEYS.LUCKY_HISTORY}-${window.location.hostname}`) || '[]')).toEqual([histEntry]);
  });

  it('addLuckyHistory should add new work as HistoryEntry with viewCount=1', () => {
    const store = new Store();
    const host = window.location.hostname;
    const work = { title: 'New Work', href: `http://${host}/new`, thumb: '/thumb.jpg' };

    vi.setSystemTime(1000);
    store.addLuckyHistory(work);

    const history = store.getState().luckyHistory;
    expect(history).toHaveLength(1);
    expect(history[0].title).toBe('New Work');
    expect(history[0].href).toBe(`http://${host}/new`);
    expect(history[0].viewCount).toBe(1);
    expect(history[0].firstViewedAt).toBe(1000);
    expect(history[0].lastViewedAt).toBe(1000);
  });

  it('addLuckyHistory should normalize URL on entry creation', () => {
    const store = new Store();
    const host = window.location.hostname;
    const work = { title: 'Work', href: `http://${host}/page?q=1#hash`, thumb: '' };

    store.addLuckyHistory(work);
    expect(store.getState().luckyHistory[0].href).toBe(`http://${host}/page`);
  });

  it('addLuckyHistory should not increment viewCount within 24 hours', () => {
    const store = new Store();
    const host = window.location.hostname;
    const work = { title: 'Work', href: `http://${host}/same`, thumb: '' };

    vi.setSystemTime(1000);
    store.addLuckyHistory(work);

    // Re-visit 1 hour later (within 24h)
    vi.setSystemTime(1000 + 60 * 60 * 1000);
    store.addLuckyHistory(work);

    const history = store.getState().luckyHistory;
    expect(history).toHaveLength(1);
    expect(history[0].viewCount).toBe(1);
    expect(history[0].lastViewedAt).toBe(1000 + 60 * 60 * 1000);
  });

  it('addLuckyHistory should increment viewCount after 24 hours', () => {
    const store = new Store();
    const host = window.location.hostname;
    const work = { title: 'Work', href: `http://${host}/same`, thumb: '' };

    vi.setSystemTime(1000);
    store.addLuckyHistory(work);

    // Re-visit 25 hours later (beyond 24h)
    const twentyFiveHours = 25 * 60 * 60 * 1000;
    vi.setSystemTime(1000 + twentyFiveHours);
    store.addLuckyHistory(work);

    const history = store.getState().luckyHistory;
    expect(history).toHaveLength(1);
    expect(history[0].viewCount).toBe(2);
    expect(history[0].firstViewedAt).toBe(1000);
    expect(history[0].lastViewedAt).toBe(1000 + twentyFiveHours);
  });

  it('addLuckyHistory should deduplicate by normalized URL', () => {
    const store = new Store();
    const host = window.location.hostname;

    vi.setSystemTime(1000);
    store.addLuckyHistory({ title: 'Work', href: `http://${host}/same?q=1`, thumb: '' });

    vi.setSystemTime(1000 + 25 * 60 * 60 * 1000);
    store.addLuckyHistory({ title: 'Work', href: `http://${host}/same?q=2#hash`, thumb: '' });

    expect(store.getState().luckyHistory).toHaveLength(1);
    expect(store.getState().luckyHistory[0].viewCount).toBe(2);
  });

  it('addLuckyHistory should keep most recent entry first', () => {
    const store = new Store();
    const host = window.location.hostname;

    vi.setSystemTime(1000);
    store.addLuckyHistory({ title: 'Work A', href: `http://${host}/a`, thumb: '' });
    vi.setSystemTime(2000);
    store.addLuckyHistory({ title: 'Work B', href: `http://${host}/b`, thumb: '' });

    const history = store.getState().luckyHistory;
    expect(history[0].href).toBe(`http://${host}/b`);
    expect(history[1].href).toBe(`http://${host}/a`);
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

  it('should persist favorites with tags', () => {
    const store = new Store();
    const favorites = [
      {
        title: 'Tagged Work',
        href: 'url1',
        thumb: 'img1',
        tags: [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      }
    ];
    store.setState({ favorites });

    const host = window.location.hostname;
    const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEYS.FAVORITES}-${host}`) || '[]');
    expect(saved[0].tags).toEqual(favorites[0].tags);

    const store2 = new Store();
    expect(store2.getState().favorites[0].tags).toEqual(favorites[0].tags);
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