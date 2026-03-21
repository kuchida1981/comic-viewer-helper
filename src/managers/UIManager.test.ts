import { Store, StoreState } from '../store';
import { UIManager } from './UIManager';
import { vi, describe, it, expect, beforeEach, Mock, afterEach } from 'vitest';
import { createPowerButton } from '../ui/components/PowerButton';
import { createPageCounter } from '../ui/components/PageCounter';
import { createSpreadControls } from '../ui/components/SpreadControls';
import { createAutoplayControls } from '../ui/components/AutoplayControls';
import { createNavigationButtons } from '../ui/components/NavigationButtons';
import { createSearchModal } from '../ui/components/SearchModal';
import { createMetadataModal } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';
import { createResumeNotification } from '../ui/components/ResumeNotification';
import { createFavoritesModal } from '../ui/components/FavoritesModal';

vi.mock('../ui/styles', () => ({ injectStyles: vi.fn() }));
vi.mock('../ui/components/SyncSettings', () => ({ createSyncSettings: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/PowerButton', () => ({ createPowerButton: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/PageCounter', () => ({ createPageCounter: vi.fn().mockReturnValue({ el: document.createElement('div'), input: document.createElement('input'), update: vi.fn() }) }));
vi.mock('../ui/components/SpreadControls', () => ({ createSpreadControls: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/AutoplayControls', () => ({ createAutoplayControls: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/NavigationButtons', () => ({ createNavigationButtons: vi.fn().mockReturnValue({ navElements: [document.createElement('button')], utilElements: [document.createElement('button')], update: vi.fn() }) }));
vi.mock('../ui/components/MetadataModal', () => ({ createMetadataModal: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/HelpModal', () => ({ createHelpModal: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/SearchModal', () => ({ createSearchModal: vi.fn().mockReturnValue({ el: document.createElement('div'), updateResults: vi.fn(), setUpdating: vi.fn() }) }));
vi.mock('../ui/components/FavoritesModal', () => ({ createFavoritesModal: vi.fn().mockReturnValue({ el: document.createElement('div'), updateFavorites: vi.fn(), updateHistory: vi.fn(), updatePinnedTags: vi.fn() }) }));
vi.mock('../ui/components/ProgressBar', () => ({ createProgressBar: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/ResumeNotification', () => ({ createResumeNotification: vi.fn().mockReturnValue({ el: document.createElement('div') }) }));
vi.mock('../ui/components/LoadingIndicator', () => ({ createLoadingIndicator: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));

vi.mock('../ui/Draggable', () => ({
  Draggable: class {
    constructor(el: any, opts: any) {
      if (opts && opts.onDragEnd) {
        opts.onDragEnd(100, 200);
      }
    }
    clampToViewport() { return { top: 10, left: 20 }; }
  }
}));

describe('UIManager', () => {
  let store: Store;
  let uiManager: UIManager;
  let currentState: StoreState;

  const createMockElement = (tag: string) => {
    return {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {} as any,
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        toggle: vi.fn(),
        contains: vi.fn().mockReturnValue(false)
      },
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      remove: vi.fn(),
      querySelector: vi.fn().mockReturnValue(null),
      querySelectorAll: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      blur: vi.fn(),
      click: vi.fn(),
      replaceChildren: vi.fn()
    } as any;
  };

  beforeEach(() => {
    currentState = {
      enabled: true,
      metadata: { title: 'Manga', tags: [], relatedWorks: [] },
      isMetadataModalOpen: false,
      isHelpModalOpen: false,
      isSearchModalOpen: false,
      isFavoritesModalOpen: false,
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: null,
      isLoading: false,
      isLuckyLoading: false,
      searchResults: null,
      searchQuery: '',
      searchContext: undefined,
      searchCache: null,
      searchHistory: [],
      luckyHistory: [],
      favorites: [],
      pinnedTags: [],
      isAutoplayEnabled: false,
      autoplayInterval: 5,
      syncConfig: null
    };

    store = {
      getState: vi.fn().mockImplementation(() => currentState),
      setState: vi.fn().mockImplementation((patch) => {
        currentState = { ...currentState, ...patch };
      }),
      subscribe: vi.fn(),
      togglePinnedTag: vi.fn()
    } as unknown as Store;
    
    const adapter = {
      match: vi.fn().mockReturnValue(true),
      getContainer: vi.fn().mockReturnValue(createMockElement('div')),
      getImages: vi.fn().mockReturnValue([{ src: '1.jpg' }]),
      getMetadata: vi.fn().mockReturnValue(currentState.metadata)
    } as any;

    const navigator = { 
        getImages: vi.fn().mockReturnValue([{ src: '1.jpg' }, { src: '2.jpg' }]), 
        jumpToPage: vi.fn().mockResolvedValue(true),
        scrollToEdge: vi.fn().mockResolvedValue(undefined),
        scrollToImage: vi.fn().mockResolvedValue(undefined)
    } as any;
    
    const discoveryManager = {
      performSearch: vi.fn(),
      jumpToRandomWork: vi.fn(),
      contextsMatch: vi.fn().mockImplementation((c1, c2) => {
        if (!c1 && !c2) return true;
        if (!c1 || !c2) return false;
        return c1.type === c2.type && c1.label === c2.label;
      })
    } as any;

    uiManager = new UIManager(adapter, store, navigator, discoveryManager);

    vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(null),
        body: { appendChild: vi.fn() },
        documentElement: { classList: { toggle: vi.fn() } },
        createElement: vi.fn().mockImplementation(createMockElement),
        querySelector: vi.fn().mockReturnValue(null),
        querySelectorAll: vi.fn().mockReturnValue([])
    });
    
    vi.stubGlobal('window', {
      location: { href: 'http://site.com', origin: 'http://site.com', hostname: 'site.com' },
      innerWidth: 1024,
      innerHeight: 768,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn().mockImplementation((event) => {
        const resizeCall = (window.addEventListener as Mock).mock.calls.find(c => c[0] === 'resize');
        if (resizeCall && event.type === 'resize') resizeCall[1]();
      })
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('exhaustive function and branch coverage', async () => {
    // 1. Initialization and Store Subscription
    uiManager.init();
    expect(store.subscribe).toHaveBeenCalled();
    
    // 2. Resize Event
    window.dispatchEvent(new Event('resize'));
    expect(currentState.guiPos).toEqual({ top: 10, left: 20 });

    // 3. updateUI with all components and various states
    uiManager.updateUI();
    expect(createPowerButton).toHaveBeenCalled();
    
    // 4. Trigger Power Button Click
    const powerOnClick = (createPowerButton as Mock).mock.calls[0][0].onClick;
    powerOnClick();
    expect(currentState.enabled).toBe(false);
    uiManager.updateUI(); // Cover disabled state visibility

    powerOnClick(); // Enable back
    expect(currentState.enabled).toBe(true);
    uiManager.updateUI();

    // 5. Trigger Page Counter Jump
    const counterOnJump = (createPageCounter as Mock).mock.calls[0][0].onJump;
    await counterOnJump('2');
    
    // Test jump failure
    (uiManager as any).navigator.jumpToPage.mockResolvedValueOnce(false);
    await counterOnJump('invalid');

    // 6. Trigger Spread Controls
    const spreadProps = (createSpreadControls as Mock).mock.calls[0][0];
    spreadProps.onToggle(true);
    expect(currentState.isDualViewEnabled).toBe(true);
    spreadProps.onAdjust();
    expect(currentState.spreadOffset).toBe(1);

    // 7. Trigger Autoplay Controls
    const autoplayProps = (createAutoplayControls as Mock).mock.calls[0][0];
    autoplayProps.onToggle(true);
    expect(currentState.isAutoplayEnabled).toBe(true);
    autoplayProps.onChangeInterval(10);
    expect(currentState.autoplayInterval).toBe(10);

    // 8. Navigation Buttons Callbacks
    const navCallbacks = (createNavigationButtons as Mock).mock.calls[0][0];
    navCallbacks.onFirst();
    navCallbacks.onPrev();
    navCallbacks.onNext();
    navCallbacks.onLast();
    navCallbacks.onInfo();
    expect(currentState.isMetadataModalOpen).toBe(true);
    navCallbacks.onHelp();
    expect(currentState.isHelpModalOpen).toBe(true);
    navCallbacks.onSearch();
    expect(currentState.isSearchModalOpen).toBe(true);
    navCallbacks.onLucky();
    expect((uiManager as any).discoveryManager.jumpToRandomWork).toHaveBeenCalled();
    navCallbacks.onToggleFavorite();
    expect(currentState.favorites.length).toBe(1);
    navCallbacks.onFavoritesList();
    expect(currentState.isFavoritesModalOpen).toBe(true);

    // 9. Modals updates and interactions
    uiManager.updateUI(); // Create modal components

    // Favorites Modal Interactions
    const favModalProps = (createFavoritesModal as Mock).mock.calls[0][0];
    favModalProps.onClose();
    expect(currentState.isFavoritesModalOpen).toBe(false);

    // Re-open to cover updateFavorites branch
    currentState.isFavoritesModalOpen = true;
    uiManager.updateUI(); // favoritesModalComp already exists, calls updateFavorites

    // Help Modal Close
    const helpOnClose = (createHelpModal as Mock).mock.calls[0][0].onClose;
    helpOnClose();
    expect(currentState.isHelpModalOpen).toBe(false);

    // Metadata Modal Interactions
    const metaProps = (createMetadataModal as Mock).mock.calls[0][0];
    await metaProps.onTagClick({ text: 'Artist', href: '/a', type: 'artist' });
    expect(currentState.isMetadataModalOpen).toBe(false);
    expect(currentState.isSearchModalOpen).toBe(true);
    
    metaProps.onToggleFavorite(); // Toggle again
    metaProps.onClose();
    expect(currentState.isMetadataModalOpen).toBe(false);

    // Search Modal Interactions
    const searchProps = (createSearchModal as Mock).mock.calls[0][0];
    searchProps.onSearch('query', { type: 'keyword', label: 'query' });
    searchProps.onPageChange('http://site.com/p2');
    searchProps.onClose();
    expect(currentState.isSearchModalOpen).toBe(false);

    // 10. SWR Revalidation logic
    currentState.isSearchModalOpen = true;
    currentState.searchQuery = 'swr';
    currentState.searchContext = { type: 'keyword', label: 'swr' };
    currentState.searchCache = { 
      query: 'swr', 
      context: currentState.searchContext,
      results: { results: [], totalCount: '0', nextPageUrl: null, pagination: [] }, 
      fetchedAt: 0 // Expired
    };
    (uiManager as any).searchModalComp = null; // Force re-creation
    uiManager.updateUI();
    expect((uiManager as any).discoveryManager.performSearch).toHaveBeenCalledWith('swr', true, currentState.searchContext);

    // 11. Resume Notification
    uiManager.showResumeNotification(5);
    const resumeOnResume = (createResumeNotification as Mock).mock.calls[0][0].onResume;
    resumeOnResume();
    expect((uiManager as any).navigator.jumpToPage).toHaveBeenCalledWith(6);

    // 12. toggleFavorite explicit test (both add and remove)
    const initialFavCount = currentState.favorites.length;
    uiManager.toggleFavorite(); // Add current work
    expect(currentState.favorites.length).toBe(initialFavCount + 1);
    
    uiManager.toggleFavorite(); // Remove current work
    expect(currentState.favorites.length).toBe(initialFavCount);

    // 13. FavoritesModal onRemoveFavorite test
    const addedWork = { title: 'T', href: '/extra/', thumb: '' };
    currentState = { ...currentState, favorites: [addedWork] };
    favModalProps.onRemoveFavorite('/extra/');
    expect(currentState.favorites.length).toBe(0);

    // 14. FavoritesModal onRemoveHistory test
    const histEntry = { title: 'H', href: '/hist/', thumb: '', viewCount: 1, firstViewedAt: 1, lastViewedAt: 1 };
    currentState = { ...currentState, luckyHistory: [histEntry] };
    favModalProps.onRemoveHistory('/hist/');
    expect(currentState.luckyHistory.length).toBe(0);

    // 15. FavoritesModal onToggleFavorite test (add)
    currentState = { ...currentState, favorites: [] };
    const workToToggle = { title: 'Toggle', href: '/toggle/', thumb: '' };
    favModalProps.onToggleFavorite(workToToggle);
    expect(currentState.favorites.length).toBe(1);

    // 16. FavoritesModal onToggleFavorite test (remove)
    favModalProps.onToggleFavorite(workToToggle);
    expect(currentState.favorites.length).toBe(0);

  });
});
