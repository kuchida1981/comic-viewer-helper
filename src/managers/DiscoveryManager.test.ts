import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscoveryManager } from './DiscoveryManager';
import { Store, StoreState } from '../store';
import { SiteAdapter, SearchContext } from '../types';
import * as logic from '../logic';

vi.mock('../logic', async () => {
  const actual = await vi.importActual('../logic');
  return {
    ...actual,
    pickRandomWork: vi.fn(),
    isLuckyPoolDepleted: vi.fn(),
    normalizeUrl: actual.normalizeUrl
  };
});

describe('DiscoveryManager', () => {
  let adapter: any;
  let store: Store;
  let manager: DiscoveryManager;
  let currentState: StoreState;

  beforeEach(() => {
    currentState = {
      metadata: { title: 'T', tags: [], relatedWorks: [] },
      luckyHistory: [],
      searchCache: null,
      favorites: [],
      pinnedTags: [],
      isLuckyLoading: false,
      enabled: true,
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: null,
      isMetadataModalOpen: false,
      isHelpModalOpen: false,
      isSearchModalOpen: false,
      isFavoritesModalOpen: false,
      isLoading: false,
      searchResults: null,
      searchQuery: '',
      searchHistory: [],
      isAutoplayEnabled: false,
      autoplayInterval: 5
    };

    adapter = {
      match: vi.fn().mockReturnValue(true),
      getSearchUrl: vi.fn().mockImplementation((q) => `http://site.com/search?q=${q}`),
      parseSearchResults: vi.fn().mockReturnValue({ results: [], nextPageUrl: null, pagination: [] }),
      searchConfig: { baseUrl: '/', queryParam: 's' }
    };

    store = {
      getState: vi.fn().mockImplementation(() => currentState),
      setState: vi.fn().mockImplementation((patch) => { currentState = { ...currentState, ...patch }; }),
      subscribe: vi.fn(),
      addLuckyHistory: vi.fn()
    } as unknown as Store;

    manager = new DiscoveryManager(adapter as SiteAdapter, store);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<html><body><div class="post"></div></body></html>')
    }));
    
    vi.stubGlobal('DOMParser', class {
      parseFromString() {
        const doc = document.implementation.createHTMLDocument();
        return doc;
      }
    });

    vi.stubGlobal('window', { 
      location: { href: 'http://site.com/current', origin: 'http://site.com', hostname: 'site.com' },
      addEventListener: vi.fn()
    });
  });

  describe('jumpToRandomWork', () => {
    it('should jump immediately if pool is not depleted', async () => {
      vi.mocked(logic.isLuckyPoolDepleted).mockReturnValue(false);
      vi.mocked(logic.pickRandomWork).mockReturnValue('http://site.com/next');

      await manager.jumpToRandomWork();

      expect(logic.isLuckyPoolDepleted).toHaveBeenCalled();
      expect(logic.pickRandomWork).toHaveBeenCalled();
      expect(window.location.href).toBe('http://site.com/next');
    });

    it('should try replenishment if pool is depleted', async () => {
      vi.mocked(logic.isLuckyPoolDepleted).mockReturnValue(true);
      vi.mocked(logic.pickRandomWork).mockReturnValue('http://site.com/replenished');
      
      currentState.searchCache = { 
        query: 'q',
        results: { nextPageUrl: 'http://site.com/page2', results: [], totalCount: '0', pagination: [] },
        fetchedAt: Date.now()
      };

      await manager.jumpToRandomWork();

      expect(fetch).toHaveBeenCalledWith('http://site.com/page2');
      expect(window.location.href).toBe('http://site.com/replenished');
      expect(currentState.isLuckyLoading).toBe(false);
    });

    it('should deduplicate results when performing deep fetch', async () => {
      vi.mocked(logic.isLuckyPoolDepleted).mockReturnValue(true);
      
      currentState.searchCache = { 
        query: 'q',
        results: { 
          nextPageUrl: 'http://site.com/page2', 
          results: [{ title: 'Existing', href: 'http://site.com/existing', thumb: '' }], 
          totalCount: '1', pagination: [] 
        },
        fetchedAt: Date.now()
      };

      // Mock next page results containing both new and duplicate item
      adapter.parseSearchResults.mockReturnValue({
        results: [
          { title: 'New', href: 'http://site.com/new', thumb: '' },
          { title: 'Duplicate', href: 'http://site.com/existing', thumb: '' } // Same href
        ],
        nextPageUrl: null,
        totalCount: '2',
        pagination: []
      });

      await manager.jumpToRandomWork();

      const mergedResults = currentState.searchCache.results.results;
      expect(mergedResults).toHaveLength(2); // Existing + New (Duplicate removed)
      expect(mergedResults.map(r => r.title)).toContain('Existing');
      expect(mergedResults.map(r => r.title)).toContain('New');
    });

    it('should ignore subsequent requests while loading', async () => {
      vi.mocked(logic.isLuckyPoolDepleted).mockReturnValue(true);
      currentState.metadata.tags = [{ text: 'T', href: '/t', type: 'tag' }];
      
      const firstJump = manager.jumpToRandomWork();
      await manager.jumpToRandomWork();
      await firstJump;

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle replenishment failure gracefully', async () => {
      vi.mocked(logic.isLuckyPoolDepleted).mockReturnValue(true);
      vi.mocked(logic.pickRandomWork).mockReturnValue('http://site.com/fallback');
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await manager.jumpToRandomWork();

      expect(window.location.href).toBe('http://site.com/fallback');
      expect(currentState.isLuckyLoading).toBe(false);
    });
  });

  describe('performSearch', () => {
    it('should perform keyword search and update store', async () => {
      const results = { results: [{ title: 'Res', href: '/res', thumb: 't.jpg' }], totalCount: '1', nextPageUrl: null, pagination: [] };
      adapter.parseSearchResults.mockReturnValue(results);

      await manager.performSearch('test query');

      expect(adapter.getSearchUrl).toHaveBeenCalledWith('test query');
      expect(currentState.searchQuery).toBe('test query');
      expect(currentState.searchHistory).toContain('test query');
      expect(currentState.searchCache?.query).toBe('test query');
      expect(currentState.searchResults).toEqual(results);
    });

    it('should perform URL-based search (pagination)', async () => {
      await manager.performSearch('http://site.com/page/2');

      expect(fetch).toHaveBeenCalledWith('http://site.com/page/2');
      expect(currentState.searchQuery).toBe(''); // Should not update query for URLs if no context
    });

    it('should handle tag search context', async () => {
      const context: SearchContext = { type: 'artist', label: 'Artist Name' };
      await manager.performSearch('http://site.com/artist/name', false, context);

      expect(currentState.searchContext).toEqual(context);
      expect(currentState.searchQuery).toBe(''); // Should not update query for tags
    });
  });

  describe('helpers', () => {
    it('contextsMatch should work correctly', () => {
      const c1: SearchContext = { type: 'tag', label: 'A' };
      const c2: SearchContext = { type: 'tag', label: 'A' };
      const c3: SearchContext = { type: 'artist', label: 'A' };

      expect(manager.contextsMatch(c1, c2)).toBe(true);
      expect(manager.contextsMatch(c1, c3)).toBe(false);
      expect(manager.contextsMatch(undefined, undefined)).toBe(true);
      expect(manager.contextsMatch(c1, undefined)).toBe(false);
    });
  });
});
