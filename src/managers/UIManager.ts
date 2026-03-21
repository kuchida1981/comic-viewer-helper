import { injectStyles } from '../ui/styles';
import { createPowerButton, PowerButtonComponent } from '../ui/components/PowerButton';
import { createPageCounter, PageCounterComponent } from '../ui/components/PageCounter';
import { createSpreadControls, SpreadControlsComponent } from '../ui/components/SpreadControls';
import { createAutoplayControls, AutoplayControlsComponent } from '../ui/components/AutoplayControls';
import { createNavigationButtons, NavigationButtonsComponent } from '../ui/components/NavigationButtons';
import { createMetadataModal, MetadataModalComponent } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';
import { createSearchModal, SearchModalComponent } from '../ui/components/SearchModal';
import { createFavoritesModal, FavoritesModalComponent } from '../ui/components/FavoritesModal';
import { createProgressBar, ProgressBarComponent } from '../ui/components/ProgressBar';
import { createResumeNotification } from '../ui/components/ResumeNotification';
import { createLoadingIndicator, LoadingIndicatorComponent } from '../ui/components/LoadingIndicator';
import { Draggable } from '../ui/Draggable';
import { createElement } from '../ui/utils';
import { Store, StoreState } from '../store';
import { Navigator } from './Navigator';
import { DiscoveryManager } from './DiscoveryManager';
import { SiteAdapter, SearchContext, SearchCache, Tag, RelatedWork } from '../types';
import { normalizeUrl } from '../logic';

const SEARCH_TTL = 60 * 60 * 1000; // 1 hour

export class UIManager {
  private adapter: SiteAdapter;
  private store: Store;
  private navigator: Navigator;
  private discoveryManager: DiscoveryManager;

  // Component references
  private powerComp: PowerButtonComponent | null = null;
  private counterComp: PageCounterComponent | null = null;
  private spreadComp: SpreadControlsComponent | null = null;
  private autoplayComp: AutoplayControlsComponent | null = null;
  private navBtnsComp: NavigationButtonsComponent | null = null;
  private progressComp: ProgressBarComponent | null = null;
  private loadingComp: LoadingIndicatorComponent | null = null;
  private draggable: Draggable | null = null;
  private topRow: HTMLElement | null = null;
  private bottomRow: HTMLElement | null = null;
  private modalComp: MetadataModalComponent | null = null;
  private helpModalEl: HTMLElement | null = null;
  private searchModalComp: SearchModalComponent | null = null;
  private favoritesModalComp: FavoritesModalComponent | null = null;

  constructor(adapter: SiteAdapter, store: Store, navigator: Navigator, discoveryManager: DiscoveryManager) {
    this.adapter = adapter;
    this.store = store;
    this.navigator = navigator;
    this.discoveryManager = discoveryManager;
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
      this.topRow = createElement('div', { className: 'comic-helper-row' });
      this.bottomRow = createElement('div', { className: 'comic-helper-row' });
      container.appendChild(this.topRow);
      container.appendChild(this.bottomRow);
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

    this._ensureMainControls(container, state, imgs.length);
    this._ensureOverlayComponents(state);
    this._ensureNavigationButtons(container);
    this._updateComponentStates(state);
  };

  private _ensureNavigationButtons = (container: HTMLElement): void => {
    if (!this.navBtnsComp) {
      this._addNavigationButtons(container);
    }
  };

  private _updateComponentStates = (state: StoreState): void => {
    const favorites = state.favorites as RelatedWork[] | undefined;
    const isFavorite = favorites?.some(f => f.href === window.location.href) ?? false;
    this.navBtnsComp?.update(isFavorite, state.isLuckyLoading);

    if (this.modalComp && state.isMetadataModalOpen) {
      this.modalComp.update(isFavorite);
    }
  };

  private _ensureMainControls = (container: HTMLElement, state: StoreState, totalImgs: number): void => {
    const topRow = this.topRow || container;
    const bottomRow = this.bottomRow || container;

    if (!this.powerComp) {
      this.powerComp = createPowerButton({
        isEnabled: state.enabled,
        onClick: () => this.store.setState({ enabled: !this.store.getState().enabled })
      });
      topRow.appendChild(this.powerComp.el);
    }

    if (!this.counterComp) {
      this.counterComp = createPageCounter({
        current: state.currentVisibleIndex + 1,
        total: totalImgs,
        onJump: (val: string) => { void this._handleJump(val); }
      });
      topRow.appendChild(this.counterComp.el);
    }

    if (!this.spreadComp) {
      this.spreadComp = createSpreadControls({
        isDualViewEnabled: state.isDualViewEnabled,
        onToggle: (val: boolean) => this.store.setState({ isDualViewEnabled: val }),
        onAdjust: () => this.store.setState({ spreadOffset: this.store.getState().spreadOffset === 0 ? 1 : 0 })
      });
      bottomRow.appendChild(this.spreadComp.el);
    }

    if (!this.autoplayComp) {
      this.autoplayComp = createAutoplayControls({
        isAutoplayEnabled: state.isAutoplayEnabled,
        autoplayInterval: state.autoplayInterval,
        onToggle: (val: boolean) => this.store.setState({ isAutoplayEnabled: val }),
        onChangeInterval: (val: number) => this.store.setState({ autoplayInterval: val })
      });
      bottomRow.appendChild(this.autoplayComp.el);
    }
  };

  private _ensureOverlayComponents = (state: StoreState): void => {
    if (!this.progressComp) {
      this.progressComp = createProgressBar();
      document.body.appendChild(this.progressComp.el);
    }

    if (!this.loadingComp) {
      this.loadingComp = createLoadingIndicator({ isLoading: state.isLoading });
      document.body.appendChild(this.loadingComp.el);
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
    const topRow = this.topRow || container;
    const bottomRow = this.bottomRow || container;

    this.navBtnsComp = createNavigationButtons({
      onFirst: () => { void this.navigator.scrollToEdge('start'); },
      onPrev: () => { void this.navigator.scrollToImage(-1); },
      onNext: () => { void this.navigator.scrollToImage(1); },
      onLast: () => { void this.navigator.scrollToEdge('end'); },
      onInfo: () => this.store.setState({ isMetadataModalOpen: true }),
      onHelp: () => this.store.setState({ isHelpModalOpen: true }),
      onSearch: () => this.store.setState({ isSearchModalOpen: true, searchResults: null }),
      onLucky: () => {
        void this.discoveryManager.jumpToRandomWork();
      },
      onToggleFavorite: () => { this.toggleFavorite(); },
      onFavoritesList: () => this.store.setState({ isFavoritesModalOpen: true })
    });
    this.navBtnsComp.navElements.forEach((btn: HTMLElement) => topRow.appendChild(btn));
    this.navBtnsComp.utilElements.forEach((btn: HTMLElement) => bottomRow.appendChild(btn));
  };

  private _updateModals = (state: StoreState): void => {
    this.helpModalEl = this._manageModal(state.isHelpModalOpen, this.helpModalEl, () => createHelpModal({
      onClose: () => this.store.setState({ isHelpModalOpen: false })
    }));

    this._updateSearchModal(state);
    this._updateFavoritesModal(state);

    if (state.isMetadataModalOpen) {
      if (!this.modalComp) {
        const isFavorite = state.favorites.some(f => f.href === window.location.href);
        this.modalComp = createMetadataModal({
          metadata: state.metadata,
          isFavorite,
          onClose: () => this.store.setState({ isMetadataModalOpen: false }),
          onTagClick: async (tag) => { await this._handleTagClick(tag); },
          onToggleFavorite: () => { this.toggleFavorite(); }
        });
        document.body.appendChild(this.modalComp.el);
      }
    } else if (this.modalComp) {
      this.modalComp.el.remove();
      this.modalComp = null;
    }
  };

  private _updateFavoritesModal = (state: StoreState): void => {
    if (state.isFavoritesModalOpen) {
      if (!this.favoritesModalComp) {
        this.favoritesModalComp = createFavoritesModal({
          favorites: state.favorites,
          history: state.luckyHistory,
          pinnedTags: state.pinnedTags,
          onRemoveFavorite: (href) => {
            const newFavorites = this.store.getState().favorites.filter(f => f.href !== href);
            this.store.setState({ favorites: newFavorites });
          },
          onRemoveHistory: (href) => {
            const normalizedHref = normalizeUrl(href);
            const newHistory = this.store.getState().luckyHistory.filter(e => normalizeUrl(e.href) !== normalizedHref);
            this.store.setState({ luckyHistory: newHistory });
          },
          onToggleFavorite: (work) => { this._toggleFavoriteWork(work); },
          onTogglePinTag: (tagText) => { this.store.togglePinnedTag(tagText); },
          onClose: () => this.store.setState({ isFavoritesModalOpen: false })
        });
        document.body.appendChild(this.favoritesModalComp.el);
      } else {
        this.favoritesModalComp.updateFavorites(state.favorites);
        this.favoritesModalComp.updateHistory(state.luckyHistory, state.favorites);
        this.favoritesModalComp.updatePinnedTags(state.pinnedTags);
      }
    } else if (this.favoritesModalComp) {
      this.favoritesModalComp.el.remove();
      this.favoritesModalComp = null;
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
          onSearch: (q, ctx) => { void this.discoveryManager.performSearch(q, false, ctx); },
          onPageChange: (url) => { void this.discoveryManager.performSearch(url); },
          onClose: () => this.store.setState({ isSearchModalOpen: false })
        });
        document.body.appendChild(this.searchModalComp.el);
        this._handleSearchSWR(state);
      } else {
        this.searchModalComp.updateResults(state.searchResults);
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
        void this.discoveryManager.performSearch(searchQuery);
      }
      return;
    }

    this._processSearchCache(searchCache, searchQuery, searchContext);
  };

  private _processSearchCache = (searchCache: SearchCache, searchQuery: string, searchContext?: SearchContext): void => {
    if (searchCache.query === searchQuery && this.discoveryManager.contextsMatch(searchCache.context, searchContext)) {
      this.store.setState({ searchResults: searchCache.results });
      this.searchModalComp?.updateResults(searchCache.results);
      this._revalidateCacheIfNeeded(searchCache, searchQuery, searchContext);
    } else if (searchQuery && searchContext?.type === 'keyword') {
      void this.discoveryManager.performSearch(searchQuery);
    }
  };

  private _revalidateCacheIfNeeded = (searchCache: SearchCache, searchQuery: string, searchContext?: SearchContext): void => {
    if (Date.now() - searchCache.fetchedAt > SEARCH_TTL) {
      void this.discoveryManager.performSearch(searchQuery, true, searchContext);
    }
  };

  private _performTagSearch = (tag: Tag): Promise<void> => {
    const contextType = (tag.type === 'artist' || tag.type === 'genre') ? tag.type : 'tag';
    return this.discoveryManager.performSearch(tag.href, false, { type: contextType, label: tag.text });
  };

  private _handleTagClick = (tag: Tag): Promise<void> => {
    this.store.setState({ isMetadataModalOpen: false, isSearchModalOpen: true, searchResults: null });
    return this._performTagSearch(tag);
  };

  private _toggleFavoriteWork = (work: RelatedWork): void => {
    const state = this.store.getState();
    const normalizedHref = normalizeUrl(work.href);
    const isFavorite = state.favorites.some(f => normalizeUrl(f.href) === normalizedHref);
    if (isFavorite) {
      const newFavorites = state.favorites.filter(f => normalizeUrl(f.href) !== normalizedHref);
      this.store.setState({ favorites: newFavorites });
    } else {
      this.store.setState({ favorites: [...state.favorites, work] });
    }
  };

  toggleFavorite = (): void => {
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
        thumb: this.navigator.getImages()[0]?.src || '', // Use first image as thumbnail
        tags: state.metadata.tags
      };
      this.store.setState({ favorites: [...state.favorites, currentWork] });
    }
  };

  private _updateVisibility = (container: HTMLElement, state: StoreState): void => {
    const imgs = this.navigator.getImages();
    const { enabled, currentVisibleIndex, isDualViewEnabled } = state;

    if (!enabled) {
      container.style.padding = '4px 8px';
      if (this.bottomRow) this.bottomRow.style.display = 'none';
      [this.counterComp, this.progressComp].forEach(c => { if (c) c.el.style.display = 'none'; });
      container.querySelectorAll('.comic-helper-button').forEach(btn => { (btn as HTMLElement).style.display = 'none'; });
      return;
    }

    container.style.padding = '8px';
    if (this.bottomRow) this.bottomRow.style.display = 'flex';
    if (this.counterComp) {
      this.counterComp.el.style.display = 'flex';
      this.counterComp.update(currentVisibleIndex + 1, imgs.length);
    }
    if (this.spreadComp) {
      this.spreadComp.el.style.display = 'flex';
      this.spreadComp.update(isDualViewEnabled);
    }
    if (this.autoplayComp) {
      this.autoplayComp.el.style.display = 'flex';
      this.autoplayComp.update(state.isAutoplayEnabled, state.autoplayInterval);
    }
    if (this.progressComp) {
      this.progressComp.el.style.display = 'block';
      this.progressComp.update(currentVisibleIndex, imgs.length);
    }
    container.querySelectorAll('.comic-helper-button').forEach(btn => { (btn as HTMLElement).style.display = 'inline-block'; });
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
}
