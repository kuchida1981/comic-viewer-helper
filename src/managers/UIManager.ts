import { injectStyles } from '../ui/styles';
import { createPowerButton, PowerButtonComponent } from '../ui/components/PowerButton';
import { createPageCounter, PageCounterComponent } from '../ui/components/PageCounter';
import { createSpreadControls, SpreadControlsComponent } from '../ui/components/SpreadControls';
import { createAutoplayControls, AutoplayControlsComponent } from '../ui/components/AutoplayControls';
import { createNavigationButtons, NavigationButtonsComponent } from '../ui/components/NavigationButtons';
import { createMetadataModal, MetadataModalComponent } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';
import { createSearchModal, SearchModalComponent } from '../ui/components/SearchModal';
import { createProgressBar, ProgressBarComponent } from '../ui/components/ProgressBar';
import { createResumeNotification } from '../ui/components/ResumeNotification';
import { createLoadingIndicator, LoadingIndicatorComponent } from '../ui/components/LoadingIndicator';
import { Draggable } from '../ui/Draggable';
import { createElement } from '../ui/utils';
import { jumpToRandomWork } from '../logic';
import { Store, MAX_SEARCH_HISTORY, StoreState } from '../store';
import { Navigator } from './Navigator';
import { SiteAdapter, SearchContext, isSearchableAdapter, SearchResultsState, Tag, SearchCache, SearchableAdapter, RelatedWork } from '../types';

const SEARCH_TTL = 60 * 60 * 1000; // 1 hour

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

export class UIManager {
  private adapter: SiteAdapter;
  private store: Store;
  private navigator: Navigator;

  // Component references
  private powerComp: PowerButtonComponent | null = null;
  private counterComp: PageCounterComponent | null = null;
  private spreadComp: SpreadControlsComponent | null = null;
  private autoplayComp: AutoplayControlsComponent | null = null;
  private navBtnsComp: NavigationButtonsComponent | null = null;
  private progressComp: ProgressBarComponent | null = null;
  private loadingComp: LoadingIndicatorComponent | null = null;
  private draggable: Draggable | null = null;
  private modalComp: MetadataModalComponent | null = null;
  private helpModalEl: HTMLElement | null = null;
  private searchModalComp: SearchModalComponent | null = null;

  constructor(adapter: SiteAdapter, store: Store, navigator: Navigator) {
    this.adapter = adapter;
    this.store = store;
    this.navigator = navigator;
  }

  init = (): void => {
    injectStyles();
    this.updateUI();

    this.store.subscribe(this.updateUI);

    window.addEventListener('resize', () => {
      if (this.draggable) {
        const { top, left } = this.draggable.clampToViewport();
        this.store.setState({ guiPos: { top, left } });
      }
    });
  };

  updateUI = (): void => {
    const state = this.store.getState();
    const container = this._ensureRootContainer(state.guiPos);

    this._initializeComponents(container);
    this._updateModals(state);

    this.powerComp?.update(state.enabled);
    this.loadingComp?.update(state.isLoading);

    document.documentElement.classList.toggle('comic-helper-enabled', state.enabled);

    this._updateVisibility(container, state);
  };

  private _ensureRootContainer = (guiPos: { top: number; left: number } | null): HTMLElement => {
    let container = document.getElementById('comic-helper-ui');
    if (!container) {
      container = createElement('div', { id: 'comic-helper-ui' });
      if (guiPos) {
        Object.assign(container.style, { top: `${guiPos.top}px`, left: `${guiPos.left}px`, bottom: 'auto', right: 'auto' });
      }
      this.draggable = new Draggable(container, {
        onDragEnd: (top: number, left: number) => this.store.setState({ guiPos: { top, left } })
      });
      document.body.appendChild(container);
    }
    return container;
  };

  private _initializeComponents = (container: HTMLElement): void => {
    const state = this.store.getState();
    const imgs = this.navigator.getImages();

    if (!this.powerComp) {
      this.powerComp = createPowerButton({
        isEnabled: state.enabled,
        onClick: () => this.store.setState({ enabled: !this.store.getState().enabled })
      });
      container.appendChild(this.powerComp.el);
    }

    if (!this.counterComp) {
      this.counterComp = createPageCounter({
        current: state.currentVisibleIndex + 1,
        total: imgs.length,
        onJump: (val: string) => { void this._handleJump(val); }
      });
      container.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled: state.isDualViewEnabled,
        onToggle: (val: boolean) => this.store.setState({ isDualViewEnabled: val }),
        onAdjust: () => this.store.setState({ spreadOffset: this.store.getState().spreadOffset === 0 ? 1 : 0 })
      });
      container.appendChild(this.spreadComp.el);
    }

    if (!this.autoplayComp) {
      this.autoplayComp = createAutoplayControls({
        isAutoplayEnabled: state.isAutoplayEnabled,
        autoplayInterval: state.autoplayInterval,
        onToggle: (val: boolean) => this.store.setState({ isAutoplayEnabled: val }),
        onChangeInterval: (val: number) => this.store.setState({ autoplayInterval: val })
      });
      container.appendChild(this.autoplayComp.el);
    }

    if (!this.progressComp) {
      this.progressComp = createProgressBar();
      document.body.appendChild(this.progressComp.el);
    }

    if (!this.loadingComp) {
      this.loadingComp = createLoadingIndicator({ isLoading: state.isLoading });
      document.body.appendChild(this.loadingComp.el);
    }

    if (container.querySelectorAll('.comic-helper-button').length === 0) {
      this._addNavigationButtons(container);
    }

    if (this.navBtnsComp) {
      const favorites = state.favorites || [];
      const isFavorite = favorites.some(f => f.href === window.location.href);
      this.navBtnsComp.update(isFavorite);
    }

    if (this.modalComp && state.isMetadataModalOpen) {
      const isFavorite = state.favorites.some(f => f.href === window.location.href);
      this.modalComp.update(isFavorite);
    }
  };

  private _handleJump = async (val: string): Promise<void> => {
    const success = await this.navigator.jumpToPage(val);
    if (this.counterComp) {
      this.counterComp.input.blur();
      if (!success) {
        this.counterComp.input.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        setTimeout(() => { if (this.counterComp) this.counterComp.input.style.backgroundColor = ''; }, 500);
      }
    }
  };

  private _addNavigationButtons = (container: HTMLElement): void => {
    this.navBtnsComp = createNavigationButtons({
      onFirst: () => { void this.navigator.scrollToEdge('start'); },
      onPrev: () => { void this.navigator.scrollToImage(-1); },
      onNext: () => { void this.navigator.scrollToImage(1); },
      onLast: () => { void this.navigator.scrollToEdge('end'); },
      onInfo: () => this.store.setState({ isMetadataModalOpen: true }),
      onHelp: () => this.store.setState({ isHelpModalOpen: true }),
      onSearch: () => this.store.setState({ isSearchModalOpen: true, searchResults: null }),
      onLucky: () => {
        const state = this.store.getState();
        jumpToRandomWork(state.metadata, state.searchCache, state.favorites);
      },
      onToggleFavorite: () => { this._toggleFavorite(); }
    });
    this.navBtnsComp.elements.forEach(btn => container.appendChild(btn));
  };

  private _updateModals = (state: StoreState): void => {
    this.helpModalEl = this._manageModal(state.isHelpModalOpen, this.helpModalEl, () => createHelpModal({
      onClose: () => this.store.setState({ isHelpModalOpen: false })
    }));

    this._updateSearchModal(state);

    if (state.isMetadataModalOpen) {
      if (!this.modalComp) {
        const isFavorite = state.favorites.some(f => f.href === window.location.href);
        this.modalComp = createMetadataModal({
          metadata: state.metadata,
          isFavorite,
          onClose: () => this.store.setState({ isMetadataModalOpen: false }),
          onTagClick: async (tag) => { await this._handleTagClick(tag); },
          onToggleFavorite: () => { this._toggleFavorite(); }
        });
        document.body.appendChild(this.modalComp.el);
      }
    } else if (this.modalComp) {
      this.modalComp.el.remove();
      this.modalComp = null;
    }
  };

  private _updateSearchModal = (state: StoreState): void => {
    if (state.isSearchModalOpen) {
      if (!this.searchModalComp) {
        this.searchModalComp = createSearchModal({
          searchResults: state.searchResults,
          searchQuery: state.searchQuery,
          searchContext: state.searchContext,
          searchHistory: state.searchHistory,
          onSearch: (q, ctx) => { void this._performSearch(q, false, ctx); },
          onPageChange: (url) => { void this._performSearch(url); },
          onClose: () => this.store.setState({ isSearchModalOpen: false })
        });
        document.body.appendChild(this.searchModalComp.el);
        this._handleSearchSWR(state);
      }
    } else if (this.searchModalComp) {
      this.searchModalComp.el.remove();
      this.searchModalComp = null;
    }
  };

  private _handleSearchSWR = (state: StoreState): void => {
    const { searchCache, searchQuery, searchContext } = state;
    if (!searchCache) {
      if (searchQuery && searchContext?.type === 'keyword') {
        void this._performSearch(searchQuery);
      }
      return;
    }

    this._processSearchCache(searchCache, searchQuery, searchContext);
  };

  private _processSearchCache = (searchCache: SearchCache, searchQuery: string, searchContext?: SearchContext): void => {
    if (searchCache.query === searchQuery && contextsMatch(searchCache.context, searchContext)) {
      this.store.setState({ searchResults: searchCache.results });
      this.searchModalComp?.updateResults(searchCache.results);
      this._revalidateCacheIfNeeded(searchCache, searchQuery, searchContext);
    } else if (searchQuery && searchContext?.type === 'keyword') {
      void this._performSearch(searchQuery);
    }
  };

  private _revalidateCacheIfNeeded = (searchCache: SearchCache, searchQuery: string, searchContext?: SearchContext): void => {
    if (Date.now() - searchCache.fetchedAt > SEARCH_TTL) {
      void this._performSearch(searchQuery, true, searchContext);
    }
  };

  private _handleTagClick = async (tag: Tag): Promise<void> => {
    this.store.setState({ isMetadataModalOpen: false, isSearchModalOpen: true, searchResults: null });
    const contextType = (tag.type === 'artist' || tag.type === 'genre') ? tag.type : 'tag';
    return this._performSearch(tag.href, false, { type: contextType, label: tag.text });
  };

  private _toggleFavorite = (): void => {
    const state = this.store.getState();
    const currentUrl = window.location.href;
    const isFavorite = state.favorites.some(f => f.href === currentUrl);

    if (isFavorite) {
      const newFavorites = state.favorites.filter(f => f.href !== currentUrl);
      this.store.setState({ favorites: newFavorites });
    } else {
      const currentWork: RelatedWork = {
        title: state.metadata.title,
        href: currentUrl,
        thumb: this.navigator.getImages()[0]?.src || '' // Use first image as thumbnail
      };
      this.store.setState({ favorites: [...state.favorites, currentWork] });
    }
  };

  private _updateVisibility = (container: HTMLElement, state: StoreState): void => {
    const imgs = this.navigator.getImages();
    const { enabled, currentVisibleIndex, isDualViewEnabled } = state;

    if (!enabled) {
      container.style.padding = '4px 8px';
      [this.counterComp, this.spreadComp, this.autoplayComp, this.progressComp].forEach(c => { if (c) c.el.style.display = 'none'; });
      container.querySelectorAll('.comic-helper-button').forEach(btn => { (btn as HTMLElement).style.display = 'none'; });
      return;
    }

    container.style.padding = '8px';
    if (this.counterComp) this.counterComp.el.style.display = 'flex';
    if (this.spreadComp) this.spreadComp.el.style.display = 'flex';
    if (this.autoplayComp) this.autoplayComp.el.style.display = 'flex';
    if (this.progressComp) {
      this.progressComp.el.style.display = 'block';
      this.progressComp.update(currentVisibleIndex, imgs.length);
    }
    container.querySelectorAll('.comic-helper-button').forEach(btn => { (btn as HTMLElement).style.display = 'inline-block'; });

    this.counterComp?.update(currentVisibleIndex + 1, imgs.length);
    this.spreadComp?.update(isDualViewEnabled);
    this.autoplayComp?.update(state.isAutoplayEnabled, state.autoplayInterval);
  };

  showResumeNotification = (savedIndex: number): void => {
    const notification = createResumeNotification({
      savedIndex,
      onResume: () => { void this.navigator.jumpToPage(savedIndex + 1); },
      onSkip: () => { }
    });
    document.body.appendChild(notification.el);
  };

  private _manageModal = (isOpen: boolean, modalEl: HTMLElement | null, createFn: () => { el: HTMLElement }): HTMLElement | null => {
    if (isOpen) {
      if (!modalEl) {
        const newModal = createFn();
        modalEl = newModal.el;
        document.body.appendChild(modalEl);
      }
    } else if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }
    return modalEl;
  };

  private _performSearch = async (queryOrUrl: string, silent = false, context?: SearchContext): Promise<void> => {
    if (!isSearchableAdapter(this.adapter)) return;
    if (!silent) this.store.setState({ searchResults: null });

    const isUrl = queryOrUrl.startsWith('http') || queryOrUrl.startsWith('/');
    const { url, query, searchContext } = this._getSearchParameters(queryOrUrl, context);

    this._updateStoreBeforeSearch(query, searchContext, silent, isUrl);

    this.searchModalComp?.setUpdating(true);
    try {
      const results = await this._fetchSearchResults(url);
      results.searchContext = searchContext;
      this.store.setState({ searchResults: results, searchCache: { query, results, fetchedAt: Date.now(), context: searchContext } });
      this.searchModalComp?.updateResults(results);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      this.searchModalComp?.setUpdating(false);
    }
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

  private _fetchSearchResults = async (url: string): Promise<SearchResultsState> => {
    const searchableAdapter = this.adapter as SearchableAdapter;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return searchableAdapter.parseSearchResults(doc);
  };

  private _updateSearchHistory = (query: string): void => {
    const { searchHistory } = this.store.getState();
    const normalizedNew = normalizeQuery(query);
    const filtered = searchHistory.filter(h => normalizeQuery(h) !== normalizedNew);
    const newHistory = [query, ...filtered].slice(0, MAX_SEARCH_HISTORY);
    this.store.setState({ searchHistory: newHistory });
  };
}
