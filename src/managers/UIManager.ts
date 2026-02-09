import { injectStyles } from '../ui/styles';
import { createPowerButton, PowerButtonComponent } from '../ui/components/PowerButton';
import { createPageCounter, PageCounterComponent } from '../ui/components/PageCounter';
import { createSpreadControls, SpreadControlsComponent } from '../ui/components/SpreadControls';
import { createNavigationButtons, NavigationButtonsComponent } from '../ui/components/NavigationButtons';
import { createMetadataModal } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';
import { createSearchModal, SearchModalComponent } from '../ui/components/SearchModal';
import { createProgressBar, ProgressBarComponent } from '../ui/components/ProgressBar';
import { createResumeNotification } from '../ui/components/ResumeNotification';
import { createLoadingIndicator, LoadingIndicatorComponent } from '../ui/components/LoadingIndicator';
import { Draggable } from '../ui/Draggable';
import { createElement } from '../ui/utils';
import { t } from '../i18n';
import { jumpToRandomWork } from '../logic';
import { Store, MAX_SEARCH_HISTORY } from '../store';
import { Navigator } from './Navigator';
import { HistoryManager, HistoryRecord } from './HistoryManager';
import { SiteAdapter, SearchContext, isSearchableAdapter } from '../types';


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

export class UIManager {
  private adapter: SiteAdapter;
  private store: Store;
  private navigator: Navigator;
  private historyManager: HistoryManager;

  // Component references
  private powerComp: PowerButtonComponent | null;
  private counterComp: PageCounterComponent | null;
  private spreadComp: SpreadControlsComponent | null;
  private progressComp: ProgressBarComponent | null;
  private loadingComp: LoadingIndicatorComponent | null;
  private draggable: Draggable | null;
  private modalEl: HTMLElement | null;
  private helpModalEl: HTMLElement | null;
  private searchModalComp: SearchModalComponent | null;
  private navBtns: NavigationButtonsComponent | null;
  private cachedHistory: HistoryRecord[] = [];

  constructor(adapter: SiteAdapter, store: Store, navigator: Navigator, historyManager: HistoryManager) {
    this.adapter = adapter;
    this.store = store;
    this.navigator = navigator;
    this.historyManager = historyManager;

    // Component references
    this.powerComp = null;
    this.counterComp = null;
    this.spreadComp = null;
    this.progressComp = null;
    this.loadingComp = null;
    this.draggable = null;
    this.modalEl = null;
    this.helpModalEl = null;
    this.searchModalComp = null;
    this.navBtns = null;

    this.updateUI = this.updateUI.bind(this);
    this.init = this.init.bind(this);
  }

  init(): void {
    injectStyles();
    this.updateUI();

    // Subscribe to store changes to update UI
    this.store.subscribe(this.updateUI);

    // Handle window resize for draggable clamping
    window.addEventListener('resize', function handleWindowResize() {
      if (this.draggable) {
        const { top, left } = this.draggable.clampToViewport();
        this.store.setState({ guiPos: { top, left } });
      }
    }.bind(this));
  }

  updateUI(): void {
    const state = this.store.getState();
    const { enabled, isDualViewEnabled, guiPos, currentVisibleIndex, isLoading } = state;
    let container = document.getElementById('comic-helper-ui');

    if (!container) {
      container = createElement('div', { id: 'comic-helper-ui' });
      if (guiPos) {
        Object.assign(container.style, {
          top: `${guiPos.top}px`,
          left: `${guiPos.left}px`,
          bottom: 'auto',
          right: 'auto'
        });
      }
      this.draggable = new Draggable(container, {
        onDragEnd: function handleDragEnd(top: number, left: number) {
          this.store.setState({ guiPos: { top, left } });
        }.bind(this)
      });
      document.body.appendChild(container);
    }

    // Initialize components if they don't exist
    if (!this.powerComp) {
      this.powerComp = createPowerButton({
        isEnabled: enabled,
        onClick: function handlePowerClick() {
          const newState = !this.store.getState().enabled;
          // Revert logic is handled by Navigator via store subscription in main orchestration
          this.store.setState({ enabled: newState });
        }.bind(this)
      });
      container.appendChild(this.powerComp.el);
    }

    // We need image count for the counter. Navigator has it.
    const imgs = this.navigator.getImages();

    if (!this.counterComp) {
      this.counterComp = createPageCounter({
        current: currentVisibleIndex + 1,
        total: imgs.length,
        onJump: function handleJump(val: string) {
          (async () => {
            const success = await this.navigator.jumpToPage(val);
            if (this.counterComp) {
              this.counterComp.input.blur();
              if (!success) {
                this.counterComp.input.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                setTimeout(function resetBg() {
                  if (this.counterComp) this.counterComp.input.style.backgroundColor = '';
                }.bind(this), 500);
              }
            }
          })();
        }.bind(this)
      });
      container.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled,
        onToggle: function handleSpreadToggle(val: boolean) { this.store.setState({ isDualViewEnabled: val }); }.bind(this),
        onAdjust: function handleSpreadAdjust() {
          const { spreadOffset } = this.store.getState();
          this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
        }.bind(this)
      });
      container.appendChild(this.spreadComp.el);
    }

    if (!this.progressComp) {
      this.progressComp = createProgressBar();
      document.body.appendChild(this.progressComp.el);
    }

    if (!this.loadingComp) {
      this.loadingComp = createLoadingIndicator({ isLoading });
      document.body.appendChild(this.loadingComp.el);
    }

    if (!this.navBtns) {
      const { metadata, isAutoplayEnabled } = state;

      this.navBtns = createNavigationButtons({
        onFirst: function handleFirst() { void this.navigator.scrollToEdge('start'); }.bind(this),
        onPrev: function handlePrev() { void this.navigator.scrollToImage(-1); }.bind(this),
        onNext: function handleNext() { void this.navigator.scrollToImage(1); }.bind(this),
        onLast: function handleLast() { void this.navigator.scrollToEdge('end'); }.bind(this),
        onInfo: function handleInfo() { this.store.setState({ isMetadataModalOpen: true }); }.bind(this),
        onHelp: function handleHelp() { this.store.setState({ isHelpModalOpen: true }); }.bind(this),
        onSearch: function handleSearch() { this.store.setState({ isSearchModalOpen: true, searchResults: null }); }.bind(this),
        onLucky: function handleLucky() { jumpToRandomWork(metadata, state.searchCache); }.bind(this),
        onAutoplay: function handleAutoplayToggle() {
          const current = this.store.getState().isAutoplayEnabled;
          this.store.setState({ isAutoplayEnabled: !current });
        }.bind(this),
        isAutoplayEnabled
      });
      this.navBtns.elements.forEach(function appendBtn(btn) { container?.appendChild(btn); });
    }

    const { isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen, metadata, isAutoplayEnabled } = state;

    // Handle Modals
    this.helpModalEl = this._manageModal(
      isHelpModalOpen,
      this.helpModalEl,
      function createHelp() {
        return createHelpModal({
          onClose: function handleHelpClose() { this.store.setState({ isHelpModalOpen: false }); }.bind(this)
        });
      }.bind(this)
    );

    if (isSearchModalOpen) {
      if (!this.searchModalComp) {
        const { searchResults, searchQuery, searchCache, searchHistory, searchContext } = state;

        this.searchModalComp = createSearchModal({
          searchResults,
          searchQuery,
          searchContext,
          searchHistory,
          history: this.cachedHistory,
          onSearch: function handleSearchModalSearch(query: string, context?: SearchContext) { this._performSearch(query, false, context); }.bind(this),
          onPageChange: function handleSearchModalPageChange(url: string) { this._performSearch(url); }.bind(this),
          onClose: function handleSearchModalClose() {
            this.store.setState({ isSearchModalOpen: false });
          }.bind(this),
          onDeleteHistory: async function handleSearchModalDelete(url: string) {
            await this.historyManager.deleteHistory(url);
            this.cachedHistory = await this.historyManager.getHistory();
            this.searchModalComp?.updateHistory(this.cachedHistory);
          }.bind(this),
          onClearHistory: async function handleSearchModalClear() {
            if (confirm(t('ui.clearHistory') + '?')) {
              await this.historyManager.clearHistory();
              this.cachedHistory = [];
              this.searchModalComp?.updateHistory(this.cachedHistory);
            }
          }.bind(this)
        });
        document.body.appendChild(this.searchModalComp.el);

        // Fetch history asynchronously
        void (async function fetchInitialHistory() {
          this.cachedHistory = await this.historyManager.getHistory();
          this.searchModalComp?.updateHistory(this.cachedHistory);
        }.bind(this))();

        // SWR logic
        const currentContext = state.searchContext;
        const isContextMatch = (!searchCache?.context && !currentContext) || 
                               (searchCache?.context?.type === currentContext?.type && 
                                searchCache?.context?.label === currentContext?.label);

        if (searchCache && searchCache.query === searchQuery && isContextMatch) {
          // If query and context match cache, show it immediately
          this.store.setState({ searchResults: searchCache.results });
          this.searchModalComp.updateResults(searchCache.results);

          // Check if expired
          if (Date.now() - searchCache.fetchedAt > SEARCH_TTL) {
            void this._performSearch(searchQuery, true, currentContext);
          }
        } else if (searchQuery && currentContext?.type === 'keyword') {
          // Perform search if cache doesn't exist or query is different
          // Only auto-trigger for keyword searches to avoid double-searching on tags
          void this._performSearch(searchQuery);
        }
      }
    } else {
      if (this.searchModalComp) {
        this.searchModalComp.el.remove();
        this.searchModalComp = null;
      }
    }

    this.modalEl = this._manageModal(
      isMetadataModalOpen,
      this.modalEl,
      function createMetadata() {
        return createMetadataModal({
          metadata,
          onClose: function handleMetadataClose() { this.store.setState({ isMetadataModalOpen: false }); }.bind(this),
          onTagClick: function handleMetadataTagClick(tag) {
            this.store.setState({ 
              isMetadataModalOpen: false, 
              isSearchModalOpen: true,
              searchResults: null
            });
            // Map tag type to SearchContext type
            const contextType: 'tag' | 'artist' | 'genre' = (tag.type === 'artist' || tag.type === 'genre') ? tag.type : 'tag';
            
            return this._performSearch(tag.href, false, {
              type: contextType,
              label: tag.text
            });
          }.bind(this)
        });
      }.bind(this)
    );

    this.powerComp?.update(enabled);
    this.loadingComp?.update(isLoading);

    // Toggle global scrollbar visibility
    document.documentElement.classList.toggle('comic-helper-enabled', enabled);


    if (!enabled) {
      container.style.padding = '4px 8px';
      if (this.counterComp) this.counterComp.el.style.display = 'none';
      if (this.spreadComp) this.spreadComp.el.style.display = 'none';
      if (this.progressComp) this.progressComp.el.style.display = 'none';
      container.querySelectorAll('.comic-helper-button').forEach(btn => {
        (btn as HTMLElement).style.display = 'none';
      });
      return;
    }

    container.style.padding = '8px';
    if (this.counterComp) this.counterComp.el.style.display = 'flex';
    if (this.spreadComp) this.spreadComp.el.style.display = 'flex';
    if (this.progressComp) {
      this.progressComp.el.style.display = 'block';
      this.progressComp.update(currentVisibleIndex, imgs.length);
    }
    container.querySelectorAll('.comic-helper-button').forEach(btn => {
      (btn as HTMLElement).style.display = 'inline-block';
    });

    this.counterComp?.update(currentVisibleIndex + 1, imgs.length);
    this.spreadComp?.update(isDualViewEnabled);
    this.navBtns?.update(isAutoplayEnabled);
  }

  /**
   * Show resume notification
   */
  showResumeNotification(savedIndex: number): void {
    const notification = createResumeNotification({
      savedIndex,
      onResume: function handleResume() {
        this.navigator.jumpToPage(savedIndex + 1);
      }.bind(this),
      onSkip: function handleSkip() {
        // 何もしない（最初から読む）
      }
    });
    document.body.appendChild(notification.el);
  }

  /**
   * Private helper to manage modal lifecycle (creation and destruction)
   */
  private _manageModal(
    isOpen: boolean,
    modalEl: HTMLElement | null,
    createFn: () => { el: HTMLElement }
  ): HTMLElement | null {
    if (isOpen) {
      if (!modalEl) {
        const newModal = createFn();
        modalEl = newModal.el;
        document.body.appendChild(modalEl);
      }
    } else {
      if (modalEl) {
        modalEl.remove();
        modalEl = null;
      }
    }
    return modalEl;
  }

  /**
   * Perform search and update store/cache
   */
  private async _performSearch(queryOrUrl: string, silent = false, context?: SearchContext): Promise<void> {
    if (!isSearchableAdapter(this.adapter)) return;

    // Clear previous results to avoid flicker
    if (!silent) {
      this.store.setState({ searchResults: null });
    }

    let url: string;
    let query: string;
    let searchContext: SearchContext | undefined = context;

    const isUrl = queryOrUrl.startsWith('http') || queryOrUrl.startsWith('/');

    if (isUrl) {
      url = queryOrUrl;
      
      if (context) {
        // Explicit context provided (e.g. Tag Search) -> New Search
        // We use label as query for internal logic (cache key etc.), 
        // but we DON'T update the store's searchQuery to keep the user's last typed query
        query = context.label || '';
        searchContext = context;
      } else {
        // No context provided (e.g. Pagination) -> Continue current search
        query = this.store.getState().searchQuery;
        searchContext = this.store.getState().searchContext;
      }
    } else {
      query = queryOrUrl;
      url = this.adapter.getSearchUrl(query);
      
      if (!searchContext) {
        searchContext = { type: 'keyword', label: query };
      }

      if (!silent) {
        this.store.setState({ searchQuery: query });
        if (searchContext.type === 'keyword') {
          this._updateSearchHistory(query);
        }
      }
    }

    this.store.setState({ searchContext });
    this.searchModalComp?.setUpdating(true);

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const results = this.adapter.parseSearchResults(doc);

      results.searchContext = searchContext;

      this.store.setState({
        searchResults: results,
        searchCache: {
          query,
          results,
          fetchedAt: Date.now(),
          context: searchContext
        }
      });
      this.searchModalComp?.updateResults(results);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      this.searchModalComp?.setUpdating(false);
    }
  }

  /**
   * Update search history with normalization and limit
   */
  private _updateSearchHistory(query: string): void {
    const { searchHistory } = this.store.getState();
    const normalizedNew = normalizeQuery(query);

    // Remove duplicates (normalized) and add to front
    const filtered = searchHistory.filter(h => normalizeQuery(h) !== normalizedNew);
    const newHistory = [query, ...filtered].slice(0, MAX_SEARCH_HISTORY);

    this.store.setState({ searchHistory: newHistory });
  }
}
