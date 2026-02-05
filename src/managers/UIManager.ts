import { injectStyles } from '../ui/styles';
import { createPowerButton, PowerButtonComponent } from '../ui/components/PowerButton';
import { createPageCounter, PageCounterComponent } from '../ui/components/PageCounter';
import { createSpreadControls, SpreadControlsComponent } from '../ui/components/SpreadControls';
import { createNavigationButtons } from '../ui/components/NavigationButtons';
import { createMetadataModal } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';
import { createSearchModal, SearchModalComponent } from '../ui/components/SearchModal';
import { createProgressBar, ProgressBarComponent } from '../ui/components/ProgressBar';
import { createResumeNotification } from '../ui/components/ResumeNotification';
import { createLoadingIndicator, LoadingIndicatorComponent } from '../ui/components/LoadingIndicator';
import { Draggable } from '../ui/Draggable';
import { createElement } from '../ui/utils';
import { jumpToRandomWork } from '../logic';
import { Store } from '../store';
import { Navigator } from './Navigator';
import { SiteAdapter } from '../types';


const SEARCH_TTL = 60 * 60 * 1000; // 1 hour

export class UIManager {
  private adapter: SiteAdapter;
  private store: Store;
  private navigator: Navigator;

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

  constructor(adapter: SiteAdapter, store: Store, navigator: Navigator) {
    this.adapter = adapter;
    this.store = store;
    this.navigator = navigator;

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

    this.updateUI = this.updateUI.bind(this);
    this.init = this.init.bind(this);
  }

  init(): void {
    injectStyles();
    this.updateUI();

    // Subscribe to store changes to update UI
    this.store.subscribe(this.updateUI);

    // Handle window resize for draggable clamping
    window.addEventListener('resize', () => {
      if (this.draggable) {
        const { top, left } = this.draggable.clampToViewport();
        this.store.setState({ guiPos: { top, left } });
      }
    });
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
        onDragEnd: (top: number, left: number) => this.store.setState({ guiPos: { top, left } })
      });
      document.body.appendChild(container);
    }

    // Initialize components if they don't exist
    if (!this.powerComp) {
      this.powerComp = createPowerButton({
        isEnabled: enabled,
        onClick: () => {
          const newState = !this.store.getState().enabled;
          // Revert logic is handled by Navigator via store subscription in main orchestration
          this.store.setState({ enabled: newState });
        }
      });
      container.appendChild(this.powerComp.el);
    }

    // We need image count for the counter. Navigator has it.
    const imgs = this.navigator.getImages();

    if (!this.counterComp) {
      this.counterComp = createPageCounter({
        current: currentVisibleIndex + 1,
        total: imgs.length,
        onJump: (val: string) => {
          (async () => {
            const success = await this.navigator.jumpToPage(val);
            if (this.counterComp) {
              this.counterComp.input.blur();
              if (!success) {
                this.counterComp.input.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                setTimeout(() => {
                  if (this.counterComp) this.counterComp.input.style.backgroundColor = '';
                }, 500);
              }
            }
          })();
        }
      });
      container.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled,
        onToggle: (val: boolean) => this.store.setState({ isDualViewEnabled: val }),
        onAdjust: () => {
          const { spreadOffset } = this.store.getState();
          this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
        }
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

    if (container.querySelectorAll('.comic-helper-button').length === 0) {
      const { metadata } = state;

      const navBtns = createNavigationButtons({
        onFirst: () => { void this.navigator.scrollToEdge('start'); },
        onPrev: () => { void this.navigator.scrollToImage(-1); },
        onNext: () => { void this.navigator.scrollToImage(1); },
        onLast: () => { void this.navigator.scrollToEdge('end'); },
        onInfo: () => this.store.setState({ isMetadataModalOpen: true }),
        onHelp: () => this.store.setState({ isHelpModalOpen: true }),
        onSearch: () => this.store.setState({ isSearchModalOpen: true }),
        onLucky: () => { jumpToRandomWork(metadata); }
      });
      navBtns.elements.forEach(btn => container?.appendChild(btn));
    }

    const { isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen, metadata } = state;

    // Handle Modals
    this.helpModalEl = this._manageModal(
      isHelpModalOpen,
      this.helpModalEl,
      () => createHelpModal({
        onClose: () => this.store.setState({ isHelpModalOpen: false })
      })
    );

    if (isSearchModalOpen) {
      if (!this.searchModalComp) {
        const { searchResults, searchQuery, searchCache } = state;

        this.searchModalComp = createSearchModal({
          searchResults,
          searchQuery,
          onSearch: (query: string) => this._performSearch(query),
          onPageChange: (url: string) => this._performSearch(url),
          onClose: () => {
            this.store.setState({ isSearchModalOpen: false });
          }
        });
        document.body.appendChild(this.searchModalComp.el);

        // SWR logic
        if (searchCache && searchCache.query === searchQuery) {
          // If query matches cache, show it immediately
          this.store.setState({ searchResults: searchCache.results });
          this.searchModalComp.updateResults(searchCache.results);

          // Check if expired
          if (Date.now() - searchCache.fetchedAt > SEARCH_TTL) {
            void this._performSearch(searchQuery, true);
          }
        } else if (searchQuery) {
          // Perform search if cache doesn't exist or query is different
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
      () => createMetadataModal({
        metadata,
        onClose: () => this.store.setState({ isMetadataModalOpen: false })
      })
    );

    this.powerComp.update(enabled);
    this.loadingComp.update(isLoading);

    // Toggle global scrollbar visibility
    document.documentElement.classList.toggle('comic-helper-enabled', enabled);


    if (!enabled) {
      container.style.padding = '4px 8px';
      this.counterComp.el.style.display = 'none';
      this.spreadComp.el.style.display = 'none';
      if (this.progressComp) this.progressComp.el.style.display = 'none';
      container.querySelectorAll('.comic-helper-button').forEach(btn => {
        (btn as HTMLElement).style.display = 'none';
      });
      return;
    }

    container.style.padding = '8px';
    this.counterComp.el.style.display = 'flex';
    this.spreadComp.el.style.display = 'flex';
    if (this.progressComp) {
      this.progressComp.el.style.display = 'block';
      this.progressComp.update(currentVisibleIndex, imgs.length);
    }
    container.querySelectorAll('.comic-helper-button').forEach(btn => {
      (btn as HTMLElement).style.display = 'inline-block';
    });

    this.counterComp.update(currentVisibleIndex + 1, imgs.length);
    this.spreadComp.update(isDualViewEnabled);
  }

  /**
   * Show resume notification
   */
  showResumeNotification(savedIndex: number): void {
    const notification = createResumeNotification({
      savedIndex,
      onResume: () => {
        this.navigator.jumpToPage(savedIndex + 1);
      },
      onSkip: () => {
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
  private async _performSearch(queryOrUrl: string, silent = false): Promise<void> {
    if (!this.adapter.getSearchUrl || !this.adapter.parseSearchResults) return;

    let url: string;
    let query: string;

    const isUrl = queryOrUrl.startsWith('http') || queryOrUrl.startsWith('/');

    if (isUrl) {
      url = queryOrUrl;
      query = this.store.getState().searchQuery;
    } else {
      query = queryOrUrl;
      url = this.adapter.getSearchUrl(query);
      if (!silent) {
        this.store.setState({ searchQuery: query });
      }
    }

    if (silent || isUrl) {
      this.searchModalComp?.setUpdating(true);
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const results = this.adapter.parseSearchResults!(doc);

      this.store.setState({
        searchResults: results,
        searchCache: {
          query,
          results,
          fetchedAt: Date.now()
        }
      });
      this.searchModalComp?.updateResults(results);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      this.searchModalComp?.setUpdating(false);
    }
  }
}
