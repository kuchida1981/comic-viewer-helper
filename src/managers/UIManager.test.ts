import { Store, StoreState } from '../store';
import { UIManager } from './UIManager';
import { vi, describe, it, expect, beforeEach, Mock, afterEach } from 'vitest';
import { createPowerButton } from '../ui/components/PowerButton';
import { createNavigationButtons } from '../ui/components/NavigationButtons';
import { createSearchModal } from '../ui/components/SearchModal';
import { createMetadataModal } from '../ui/components/MetadataModal';
import { createHelpModal } from '../ui/components/HelpModal';

vi.mock('../ui/styles', () => ({ injectStyles: vi.fn() }));
vi.mock('../ui/components/PowerButton', () => ({ createPowerButton: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/PageCounter', () => ({ createPageCounter: vi.fn().mockReturnValue({ el: document.createElement('div'), input: document.createElement('input'), update: vi.fn() }) }));
vi.mock('../ui/components/SpreadControls', () => ({ createSpreadControls: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/AutoplayControls', () => ({ createAutoplayControls: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/NavigationButtons', () => ({ createNavigationButtons: vi.fn().mockReturnValue({ elements: [document.createElement('button')], update: vi.fn() }) }));
vi.mock('../ui/components/MetadataModal', () => ({ createMetadataModal: vi.fn().mockReturnValue({ el: document.createElement('div'), update: vi.fn() }) }));
vi.mock('../ui/components/HelpModal', () => ({ createHelpModal: vi.fn().mockReturnValue({ el: document.createElement('div') }) }));
vi.mock('../ui/components/SearchModal', () => ({ createSearchModal: vi.fn().mockReturnValue({ el: document.createElement('div'), updateResults: vi.fn(), setUpdating: vi.fn() }) }));
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
    clampToViewport() { return { top: 0, left: 0 }; }
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
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: null,
      isLoading: false,
      isLuckyLoading: false,
      searchResults: null,
      searchQuery: '',
      searchCache: null,
      searchHistory: [],
      luckyHistory: [],
      favorites: [],
      isAutoplayEnabled: false,
      autoplayInterval: 5
    };

    store = {
      getState: vi.fn().mockImplementation(() => currentState),
      setState: vi.fn().mockImplementation((patch) => { 
        currentState = { ...currentState, ...patch }; 
      }),
      subscribe: vi.fn()
    } as unknown as Store;
    
    const adapter = {
      match: vi.fn().mockReturnValue(true),
      getContainer: vi.fn().mockReturnValue(createMockElement('div')),
      getImages: vi.fn().mockReturnValue([{ src: '1.jpg' }]),
      getMetadata: vi.fn().mockReturnValue(currentState.metadata)
    } as any;

    const navigator = { 
        getImages: vi.fn().mockReturnValue([{ src: '1.jpg' }]), 
        jumpToPage: vi.fn().mockResolvedValue(true),
        scrollToEdge: vi.fn(),
        scrollToImage: vi.fn()
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

  it('init and updateUI flow', () => {
    uiManager.init();
    uiManager.updateUI();
    expect(createPowerButton).toHaveBeenCalled();
    
    const callbacks = (createNavigationButtons as Mock).mock.calls[0][0];
    callbacks.onInfo();
    callbacks.onHelp();
    callbacks.onSearch();
    callbacks.onLucky();
    callbacks.onToggleFavorite();
    
    uiManager.updateUI();
    expect(createMetadataModal).toHaveBeenCalled();
    expect(createHelpModal).toHaveBeenCalled();
    expect(createSearchModal).toHaveBeenCalled();
  });

  it('search revalidation and tag clicks', async () => {
    currentState.isSearchModalOpen = true;
    currentState.searchQuery = 'test';
    currentState.searchContext = { type: 'keyword', label: 'test' };
    currentState.searchCache = { 
      query: 'test', 
      context: currentState.searchContext,
      results: { results: [], totalCount: '0', nextPageUrl: null, pagination: [] }, 
      fetchedAt: 0 
    };
    uiManager.updateUI();
    
    const tag = { text: 'Artist', href: '/a', type: 'artist' };
    await (uiManager as any)._handleTagClick(tag);
    expect((uiManager as any).discoveryManager.performSearch).toHaveBeenCalled();
  });

  it('visibility and helper methods', async () => {
    const container = createMockElement('div');
    const manager = uiManager as any;
    
    manager._updateVisibility(container, currentState);
    currentState.enabled = false;
    manager._updateVisibility(container, currentState);
    
    uiManager.showResumeNotification(5);
    expect(document.body.appendChild).toHaveBeenCalled();
    
    manager._manageModal(true, null, () => ({ el: createMockElement('div') }));
    await manager._handleJump('5');
    manager._toggleFavorite();
  });
});
