import { Store, MAX_SEARCH_HISTORY } from '../store';
import { SiteAdapter, SearchContext, isSearchableAdapter, SearchableAdapter, SearchResultsState } from '../types';
import { pickRandomWork, isLuckyPoolDepleted } from '../logic';

/**
 * Normalize query for comparison (lowercase, trim, sort tokens)
 */
function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .sort()
    .join(' ');
}

/**
 * Check if search contexts match
 */
function contextsMatch(c1?: SearchContext, c2?: SearchContext): boolean {
  if (!c1 && !c2) return true;
  if (!c1 || !c2) return false;
  return c1.type === c2.type && c1.label === c2.label;
}

export class DiscoveryManager {
  private adapter: SiteAdapter;
  private store: Store;

  constructor(adapter: SiteAdapter, store: Store) {
    this.adapter = adapter;
    this.store = store;
  }

  performSearch = async (queryOrUrl: string, silent = false, context?: SearchContext): Promise<void> => {
    if (!isSearchableAdapter(this.adapter)) return;
    if (!silent) this.store.setState({ searchResults: null });

    const isUrl = queryOrUrl.startsWith('http') || queryOrUrl.startsWith('/');
    const { url, query, searchContext } = this._getSearchParameters(queryOrUrl, context);

    this._updateStoreBeforeSearch(query, searchContext, silent, isUrl);

    try {
      const results = await this.fetchSearchResults(url);
      results.searchContext = searchContext;
      this.store.setState({
        searchResults: results,
        searchCache: { query, results, fetchedAt: Date.now(), context: searchContext }
      });
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    }
  };

  fetchSearchResults = async (url: string): Promise<SearchResultsState> => {
    const searchableAdapter = this.adapter as SearchableAdapter;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return searchableAdapter.parseSearchResults(doc);
  };

  private _updateStoreBeforeSearch = (query: string, context: SearchContext, silent: boolean, isUrl: boolean): void => {
    this.store.setState({ searchContext: context });
    if (!silent && !isUrl && context.type === 'keyword') {
      this.store.setState({ searchQuery: query });
      this._updateSearchHistory(query);
    }
  };

  private _getSearchParameters = (queryOrUrl: string, context?: SearchContext): { url: string; query: string; searchContext: SearchContext } => {
    const isUrl = queryOrUrl.startsWith('http') || queryOrUrl.startsWith('/');
    if (isUrl) {
      const query = context ? (context.label || '') : this.store.getState().searchQuery;
      const searchContext = context || this.store.getState().searchContext || { type: 'keyword', label: query };
      return { url: queryOrUrl, query, searchContext };
    }
    const query = queryOrUrl;
    const searchableAdapter = this.adapter as SearchableAdapter;
    const url = searchableAdapter.getSearchUrl(query);
    const searchContext = context || { type: 'keyword', label: query };
    return { url, query, searchContext };
  };

  private _updateSearchHistory = (query: string): void => {
    const { searchHistory } = this.store.getState();
    const normalizedNew = normalizeQuery(query);
    const filtered = searchHistory.filter(h => normalizeQuery(h) !== normalizedNew);
    const newHistory = [query, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    this.store.setState({ searchHistory: newHistory });
  };

  /**
   * Helper for UIManager to check context match
   */
  contextsMatch = (c1?: SearchContext, c2?: SearchContext): boolean => {
    return contextsMatch(c1, c2);
  };

  jumpToRandomWork = async (): Promise<void> => {
    const state = this.store.getState();
    if (state.isLuckyLoading) return;

    this.store.setState({ isLuckyLoading: true });
    try {
      const currentUrl = window.location.href;

      // Check if replenishment is needed
      if (isLuckyPoolDepleted(state.metadata, state.luckyHistory, currentUrl, state.searchCache, state.favorites)) {
        await this._replenishCandidates();
      }

      // Pick and jump
      const finalState = this.store.getState();
      const nextUrl = pickRandomWork(
        finalState.metadata,
        finalState.luckyHistory,
        currentUrl,
        finalState.searchCache,
        finalState.favorites
      );

      if (nextUrl) {
        window.location.href = nextUrl;
      }
    } catch (error) {
      console.error('Jump to random work failed:', error);
    } finally {
      this.store.setState({ isLuckyLoading: false });
    }
  };

  private _replenishCandidates = async (): Promise<void> => {
    // 1. Deep Fetch (Search Cache Next Page)
    if (await this._tryDeepFetch()) return;

    // 2. Tag-based Fetch
    await this._tryTagFetch();
  };

  private _tryDeepFetch = async (): Promise<boolean> => {
    const { searchCache } = this.store.getState();
    if (searchCache?.results.nextPageUrl) {
      const results = await this.fetchSearchResults(searchCache.results.nextPageUrl);
      
      // Deduplicate: only add results that are not already in cache
      const existingHrefs = new Set(searchCache.results.results.map(r => r.href));
      const newUniqueResults = results.results.filter(r => !existingHrefs.has(r.href));
      
      const mergedResults: SearchResultsState = {
        ...results,
        results: [...searchCache.results.results, ...newUniqueResults]
      };
      this.store.setState({
        searchCache: { ...searchCache, results: mergedResults, fetchedAt: Date.now() }
      });
      return true;
    }
    return false;
  };

  private _tryTagFetch = async (): Promise<void> => {
    const { metadata } = this.store.getState();
    if (metadata.tags.length === 0) return;

    // Pick a random tag
    const tag = metadata.tags[Math.floor(Math.random() * metadata.tags.length)];
    const contextType = (tag.type === 'artist' || tag.type === 'genre') ? tag.type : 'tag';
    const context: SearchContext = { type: contextType, label: tag.text };

    // Perform search (this will update searchCache)
    await this.performSearch(tag.href, true, context);
  };
}
