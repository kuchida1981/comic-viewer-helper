import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { UIManager } from './UIManager.js';
import { createPowerButton } from '../ui/components/PowerButton.js';
import { injectStyles } from '../ui/styles.js';
import { createPageCounter } from '../ui/components/PageCounter.js';
import { createSpreadControls } from '../ui/components/SpreadControls.js';
import { createNavigationButtons } from '../ui/components/NavigationButtons.js';
import { createHelpModal } from '../ui/components/HelpModal.js';
import { createMetadataModal } from '../ui/components/MetadataModal.js';
import { createSearchModal } from '../ui/components/SearchModal.js';
import { createResumeNotification } from '../ui/components/ResumeNotification.js';
import { Draggable } from '../ui/Draggable.js';
import { createElement } from '../ui/utils.js';
import { Store, StoreState } from '../store.js';
import { Navigator } from './Navigator.js';
import { DefaultAdapter } from '../adapters/DefaultAdapter.js';
import * as logic from '../logic.js';
import { setupLocationMock } from '../test/mocks/dom.js';

// Define Prop Interfaces for safe mocking
interface PowerButtonProps { onClick: () => void; }
interface PageCounterProps { onJump: (p: string) => void; }
interface SpreadControlsProps { onToggle: (val: boolean) => void; onAdjust: () => void; }
interface NavigationButtonsProps {
  onFirst: () => void; onPrev: () => void; onNext: () => void; onLast: () => void;
  onInfo: () => void; onHelp: () => void; onSearch: () => void; onLucky: () => void;
}
interface ModalProps { onClose: () => void; }
interface SearchModalProps extends ModalProps {
  onSearch: (q: string, context?: unknown) => Promise<void>;
  onPageChange: (url: string) => Promise<void>;
  onResultClick?: (e: MouseEvent) => void;
}
interface ResumeNotificationProps { onResume: () => void; onSkip: () => void; }

// Mock logic
vi.mock('../logic.js', async () => {
  const actual = await vi.importActual('../logic.js') as typeof logic;
  return {
    ...actual,
    pickRandomWork: vi.fn()
  };
});

// Mock components
vi.mock('../ui/styles.js', () => ({ injectStyles: vi.fn() }));
vi.mock('../ui/utils.js', () => ({ 
  createElement: vi.fn()
}));
vi.mock('../ui/Draggable.js', () => ({
  Draggable: vi.fn().mockImplementation(function(_el: HTMLElement, options: { onDragEnd: (t: number, l: number) => void }) {
    // Attach handler to instance for testing access
    return {
      clampToViewport: vi.fn().mockReturnValue({ top: 20, left: 30 }),
      destroy: vi.fn(),
      onDragEnd: options.onDragEnd // Expose for testing
    };
  })
}));
vi.mock('../ui/components/PowerButton.js', () => ({
  createPowerButton: vi.fn((_props: PowerButtonProps) => ({ el: { style: {}, appendChild: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/PageCounter.js', () => ({
  createPageCounter: vi.fn((_props: PageCounterProps) => ({ 
    el: { style: {}, display: '' }, 
    update: vi.fn(), 
    input: { blur: vi.fn(), style: {} } 
  }))
}));
vi.mock('../ui/components/SpreadControls.js', () => ({
  createSpreadControls: vi.fn((_props: SpreadControlsProps) => ({ el: { style: {}, display: '' }, update: vi.fn() }))
}));
vi.mock('../ui/components/ResumeNotification.js', () => ({
  createResumeNotification: vi.fn((_props: ResumeNotificationProps) => ({ el: { style: {}, display: '' } }))
}));
vi.mock('../ui/components/LoadingIndicator.js', () => ({
  createLoadingIndicator: vi.fn(() => ({ el: { style: {}, display: '' }, update: vi.fn() }))
}));
vi.mock('../ui/components/NavigationButtons.js', () => ({
  createNavigationButtons: vi.fn((_props: NavigationButtonsProps) => ({ 
    elements: [{ style: {}, querySelectorAll: vi.fn() }], 
    update: vi.fn() 
  }))
}));
vi.mock('../ui/components/MetadataModal.js', () => ({
  createMetadataModal: vi.fn((_props: ModalProps) => ({ el: { style: {}, remove: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/HelpModal.js', () => ({
  createHelpModal: vi.fn((_props: ModalProps) => ({ el: { style: {}, remove: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/SearchModal.js', () => ({
  createSearchModal: vi.fn((_props: SearchModalProps) => ({ el: { style: {}, remove: vi.fn() }, input: {}, updateResults: vi.fn(), setUpdating: vi.fn() }))
}));
vi.mock('../ui/components/ProgressBar.js', () => ({
  createProgressBar: vi.fn(() => ({ el: { style: {}, display: '' }, update: vi.fn() }))
}));

describe('UIManager', () => {
  let adapter: typeof DefaultAdapter;
  let store: Store;
  let navigator: Navigator;
  let uiManager: UIManager;

    beforeEach(() => {
      setupLocationMock('http://site.com/work/1');
      adapter = {
   
      match: vi.fn().mockReturnValue(true),
      getContainer: vi.fn().mockReturnValue(null), // Default to null for container check
      getImages: vi.fn().mockReturnValue([])
    } as unknown as typeof DefaultAdapter;
    
    const defaultState = {
      enabled: true, 
      isDualViewEnabled: false, 
      guiPos: { top: 10, left: 10 },
      currentVisibleIndex: 0,
      metadata: { title: '', tags: [], relatedWorks: [] },
      isMetadataModalOpen: false,
      isHelpModalOpen: false,
      isSearchModalOpen: false,
      spreadOffset: 0,
      isLoading: false,
      searchResults: null,
      searchQuery: '',
      searchCache: null,
      searchHistory: []
    };

    store = {
      getState: vi.fn().mockReturnValue(defaultState),
      setState: vi.fn(),
      subscribe: vi.fn()
    } as unknown as Store;

    // Use mockImplementation to allow partial overrides while keeping defaults
    (store.getState as Mock).mockImplementation(() => {
      const lastResult = ((store.getState as Mock).mock.results.at(-2)?.value || defaultState) as StoreState;
      return { ...defaultState, ...lastResult };
    });
    
    navigator = { 
        getImages: vi.fn().mockReturnValue([]), 
        jumpToPage: vi.fn(),
        scrollToEdge: vi.fn(),
        scrollToImage: vi.fn()
    } as unknown as Navigator;
    
    uiManager = new UIManager(adapter, store, navigator);

    vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(null),
        body: { appendChild: vi.fn() },
        documentElement: { 
          classList: { 
            toggle: vi.fn() 
          } 
        },
        createElement: vi.fn(),
        querySelector: vi.fn().mockReturnValue(null)
    });
    
    const mockContainer = { 
        style: {}, 
        appendChild: vi.fn(), 
        querySelectorAll: vi.fn().mockReturnValue([]) // Empty by default
    };
    (createElement as unknown as Mock).mockReturnValue(mockContainer);

    vi.stubGlobal('window', { 
      addEventListener: vi.fn(), 
      innerWidth: 1000, 
      innerHeight: 1000,
      location: { href: 'http://site.com/work/1' }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('init should inject styles and update UI', () => {
    uiManager.init();
    expect(injectStyles).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it('updateUI should create components', () => {
    uiManager.updateUI();
    expect(createPowerButton).toHaveBeenCalled();
  });

  it('updateUI should handle disabled state and toggling', () => {
    const mockBtn = { style: { display: '' } };
    (createElement as unknown as Mock).mockReturnValue({
        style: {}, appendChild: vi.fn(),
        querySelectorAll: vi.fn().mockImplementation(sel => sel === '.comic-helper-button' ? [mockBtn] : [])
    });
    
    // Disabled
    (store.getState as Mock).mockReturnValue({ enabled: false, metadata: {}, favorites: [], isMetadataModalOpen: false, isHelpModalOpen: false, currentVisibleIndex: 0 });
    uiManager.updateUI();
    expect(mockBtn.style.display).toBe('none');
    
    // Enabled
    (store.getState as Mock).mockReturnValue({ enabled: true, metadata: {}, favorites: [], isMetadataModalOpen: false, isHelpModalOpen: false, currentVisibleIndex: 0 });
    uiManager.updateUI();
    expect(mockBtn.style.display).toBe('inline-block');
  });

        it('should handle modals and their onClose callbacks', () => {

          (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true, isHelpModalOpen: true, isSearchModalOpen: true, metadata: {}, favorites: [], currentVisibleIndex: 0, searchResults: null });

          uiManager.updateUI();

          

          // Test onClose

          const createHelpModalMock = createHelpModal as unknown as Mock<(props: ModalProps) => { el: { style: object; remove: Mock } }>;

          createHelpModalMock.mock.calls[0][0].onClose();

          expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: false });

      

          const createMetadataModalMock = createMetadataModal as unknown as Mock<(props: ModalProps) => { el: { style: object; remove: Mock } }>;

          createMetadataModalMock.mock.calls[0][0].onClose();

          expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: false });

      

          const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { el: { style: object; remove: Mock } }>;

          createSearchModalMock.mock.calls[0][0].onClose();

          expect(store.setState).toHaveBeenCalledWith({ isSearchModalOpen: false });

          

          // Close modals in state and update UI

          (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: false, isHelpModalOpen: false, isSearchModalOpen: false, metadata: {}, favorites: [], currentVisibleIndex: 0, searchResults: null });

          uiManager.updateUI();

        });

      

        it('should handle search modal fetch and parse', async () => {

          const mockResults = { results: [{ title: 'A', href: '/a', thumb: '/a.jpg' }], totalCount: '1件', nextPageUrl: null };

          adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com?q=test');

          adapter.parseSearchResults = vi.fn().mockReturnValue(mockResults);

      

          const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('<html></html>') });

          vi.stubGlobal('fetch', fetchMock);

      

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            isSearchModalOpen: true,

            metadata: { title: '', tags: [], relatedWorks: [] },

            favorites: [],

            currentVisibleIndex: 0,

            searchResults: null,

            searchQuery: '',

            searchHistory: []

          });

          uiManager.updateUI();

      

          const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { el: { style: object; remove: Mock }; updateResults: Mock }>;

          const onSearch = createSearchModalMock.mock.calls[0][0].onSearch;

          await onSearch('test');

      

          expect(adapter.getSearchUrl).toHaveBeenCalledWith('test');

          expect(fetchMock).toHaveBeenCalledWith('http://search.com?q=test');

      

          // fetch → res.ok チェック+res.text() → パース の3段チェインを消費

          await Promise.resolve();

          await Promise.resolve();

          await Promise.resolve();

          await Promise.resolve();

      

          expect(adapter.parseSearchResults).toHaveBeenCalled();

          expect(store.setState).toHaveBeenCalledWith({ searchQuery: 'test' });

          expect(store.setState).toHaveBeenCalledWith({

            searchResults: {

              ...mockResults,

              searchContext: { type: 'keyword', label: 'test' }

            },

            searchCache: {

              query: 'test',

              results: {

                ...mockResults,

                searchContext: { type: 'keyword', label: 'test' }

              },

              fetchedAt: expect.any(Number),

              context: { type: 'keyword', label: 'test' }

            }

          });

      

          vi.unstubAllGlobals();

        });

      

        it('should update search history with normalization and limit', async () => {

          adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com');

          adapter.parseSearchResults = vi.fn().mockReturnValue({ results: [] });

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('') }));

      

          // Initial state: 2 items

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            isSearchModalOpen: true,

            metadata: {},

            favorites: [],

            currentVisibleIndex: 0,

            searchHistory: ['key 1', 'key 2'],

            searchResults: null,

            searchQuery: ''

          });

      

          uiManager.updateUI(); // Initialize components

      

          const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { el: { style: object; remove: Mock } }>;

          const onSearch = createSearchModalMock.mock.calls[0][0].onSearch;

      

          // 1. Add new item

          await onSearch('new key');

          expect(store.setState).toHaveBeenCalledWith({

            searchHistory: ['new key', 'key 1', 'key 2']

          });

      

          // 2. Add duplicate item (with different order and case)

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            favorites: [],

            searchHistory: ['new key', 'key 1', 'key 2']

          });

          await onSearch('KEY 1'); // Same as 'key 1'

          expect(store.setState).toHaveBeenCalledWith({

            searchHistory: ['KEY 1', 'new key', 'key 2']

          });

      

          // 3. Normalized duplicate: "key 1 a" vs "a KEY 1"

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            favorites: [],

            searchHistory: ['key 1 a', 'new key', 'key 2']

          });

          await onSearch('a KEY 1');

          expect(store.setState).toHaveBeenCalledWith({

            searchHistory: ['a KEY 1', 'new key', 'key 2']

          });

      

          // 4. Hit limit (3)

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            favorites: [],

            searchHistory: ['c', 'b', 'a']

          });

          await onSearch('d');

          expect(store.setState).toHaveBeenCalledWith({

            searchHistory: ['d', 'c', 'b']

          });

      

          vi.unstubAllGlobals();

        });

      

        it('should handle SWR: show cache immediately and fetch if expired', async () => {

          const oldCache = {

            query: 'test',

            results: { results: [{ title: 'Old', href: '/old', thumb: '/old.jpg' }], totalCount: '1', nextPageUrl: null },

            fetchedAt: Date.now() - 5000000 // Expired (> 1 hour)

          };

          const newResults = { results: [{ title: 'New', href: '/new', thumb: '/new.jpg' }], totalCount: '1', nextPageUrl: null };

          

          adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com?q=test');

          adapter.parseSearchResults = vi.fn().mockReturnValue(newResults);

          const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('<html></html>') });

          vi.stubGlobal('fetch', fetchMock);

      

          (store.getState as Mock).mockReturnValue({ 

            enabled: true, 

            isSearchModalOpen: true, 

            metadata: { title: '', tags: [], relatedWorks: [] }, 

            favorites: [],

            currentVisibleIndex: 0, 

            searchResults: null,

            searchQuery: 'test',

            searchCache: oldCache,

            searchHistory: []

          });

          

          uiManager.updateUI();

      

          // Should show cache immediately

          expect(store.setState).toHaveBeenCalledWith({ searchResults: oldCache.results });

          expect(createSearchModal).toHaveBeenCalled();

          const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { updateResults: Mock }>;

          const modal = createSearchModalMock.mock.results[0].value;

          expect(modal.updateResults).toHaveBeenCalledWith(oldCache.results);

      

          // fetch should have been called (SWR)

          expect(fetchMock).toHaveBeenCalled();

      

          await Promise.resolve();

          await Promise.resolve();

          await Promise.resolve();

          await Promise.resolve();

      

          // Should update with new results

          expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({ searchResults: newResults }));

          expect(modal.updateResults).toHaveBeenCalledWith(newResults);

      

          vi.unstubAllGlobals();

        });

      

        it('should ignore cache if context does not match even if query is the same', async () => {

          const cacheForKeyword = {

            query: 'Action',

            results: { results: [{ title: 'Keyword Result' }], totalCount: '1', nextPageUrl: null },

            fetchedAt: Date.now(),

            context: { type: 'keyword', label: 'Action' }

          };

          

          adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com?q=Action');

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('') }));

      

          // Current state: Tag search for 'Action', but cache is for keyword 'Action'

          (store.getState as Mock).mockReturnValue({ 

            enabled: true, 

            isSearchModalOpen: true, 

            metadata: { title: '', tags: [], relatedWorks: [] }, 

            favorites: [],

            currentVisibleIndex: 0, 

            searchResults: null,

            searchQuery: 'Action', // Same string

            searchContext: { type: 'tag', label: 'Action' }, // Different context!

            searchCache: cacheForKeyword,

            searchHistory: []

          });

          

          uiManager.updateUI();

      

          // Should NOT show cache because context differs

          expect(store.setState).not.toHaveBeenCalledWith({ searchResults: cacheForKeyword.results });

          

          vi.unstubAllGlobals();

        });

      

        it('should clear searchResults on search start and not update searchQuery for tag searches', async () => {

          adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com/tags/test');

          adapter.parseSearchResults = vi.fn().mockReturnValue({ results: [], totalCount: '0' });

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('') }));

      

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            isSearchModalOpen: true,

            metadata: { title: '', tags: [], relatedWorks: [] },

            favorites: [],

            currentVisibleIndex: 0,

            searchQuery: 'previous keyword',

            searchResults: { results: [{ title: 'Previous' }] },

            searchHistory: []

          });

      

          uiManager.updateUI();

          const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { el: { style: object; remove: Mock } }>;

          const props = createSearchModalMock.mock.calls[0][0];

          const setStateMock = store.setState as Mock<(patch: Partial<StoreState>) => void>;

          setStateMock.mockClear();

      

          // 1. Tag Search (Explicit context)

          const context = { type: 'tag', label: 'Tag1' } as const;

          const searchPromise = props.onSearch('http://search.com/tags/tag1', context);

      

          // Should clear searchResults immediately to avoid flicker

          expect(store.setState).toHaveBeenCalledWith({ searchResults: null });

      

          // Should NOT update searchQuery with tag name in any call

          const searchQueryCalls = setStateMock.mock.calls.filter((call: [Partial<StoreState>]) => 'searchQuery' in call[0]);

          expect(searchQueryCalls).toHaveLength(0);

          

          // Should update searchContext

          expect(store.setState).toHaveBeenCalledWith({ searchContext: context });

      

          await searchPromise;

      

          // 2. Keyword Search

          setStateMock.mockClear();

          await props.onSearch('new keyword');

      

          // Should clear searchResults immediately

          expect(store.setState).toHaveBeenCalledWith({ searchResults: null });

      

          // Should update searchQuery for keyword search

          expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({ 

            searchQuery: 'new keyword' 

          }));

      

          vi.unstubAllGlobals();

        });

      

        it('should handle pagination without context by preserving current searchQuery', async () => {

          adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com/p/2');

          adapter.parseSearchResults = vi.fn().mockReturnValue({ results: [], totalCount: '0' });

          vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('') }));

      

          (store.getState as Mock).mockReturnValue({

            enabled: true,

            isSearchModalOpen: true,

            metadata: { title: '', tags: [], relatedWorks: [] },

            favorites: [],

            currentVisibleIndex: 0,

            searchQuery: 'active keyword',

            searchContext: { type: 'keyword', label: 'active keyword' },

            searchResults: { results: [] },

            searchHistory: []

          });

      

          uiManager.updateUI();

          const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { el: { style: object; remove: Mock } }>;

          const props = createSearchModalMock.mock.calls[0][0];

          const setStateMock = store.setState as Mock<(patch: Partial<StoreState>) => void>;

          setStateMock.mockClear();

      

          await props.onPageChange('http://search.com/p/2');

      

          // Should clear results

          expect(store.setState).toHaveBeenCalledWith({ searchResults: null });

          

          // Should NOT change searchQuery (check all calls)

          const searchQueryCalls = setStateMock.mock.calls.filter((call: [Partial<StoreState>]) => 'searchQuery' in call[0]);

          expect(searchQueryCalls).toHaveLength(0);

      

          vi.unstubAllGlobals();

        });

      

        it('should handle resize for draggable', () => {

          uiManager.init();

          const addEventListenerMock = window.addEventListener as Mock;

          const calls = addEventListenerMock.mock.calls;

          const resizeCall = calls.find(c => c[0] === 'resize');

          if (!resizeCall) throw new Error('Resize listener not found');

          const resizeCb = resizeCall[1] as () => void;

          

              // @ts-expect-error - accessing private property

          

               

          

              uiManager.draggable = { clampToViewport: vi.fn().mockReturnValue({ top: 50, left: 50 }) } as any;

          

              resizeCb();

          expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 50, left: 50 } });

        });

      

        it('onDragEnd should update store', () => {

          uiManager.updateUI();

          const draggableMock = Draggable as unknown as Mock<(el: HTMLElement, opts: { onDragEnd: (t: number, l: number) => void }) => { onDragEnd: (t: number, l: number) => void }>;

          const onDragEnd = draggableMock.mock.calls[0][1].onDragEnd;

          onDragEnd(100, 200);

          expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 100, left: 200 } });

        });

      

        it('component callbacks should work', () => {

          uiManager.updateUI();

          

          const createPowerButtonMock = createPowerButton as unknown as Mock<(props: PowerButtonProps) => { el: object }>;

          const powerOnClick = createPowerButtonMock.mock.calls[0][0].onClick;

          (store.getState as Mock).mockReturnValue({ enabled: true, favorites: [] });

          powerOnClick();

          expect(store.setState).toHaveBeenCalledWith({ enabled: false });

      

          const createPageCounterMock = createPageCounter as unknown as Mock<(props: PageCounterProps) => { el: object }>;

          const counterOnJump = createPageCounterMock.mock.calls[0][0].onJump;

          counterOnJump('5');

          expect(navigator.jumpToPage).toHaveBeenCalledWith('5');

      

          const createSpreadControlsMock = createSpreadControls as unknown as Mock<(props: SpreadControlsProps) => { el: object }>;

          const spreadOnToggle = createSpreadControlsMock.mock.calls[0][0].onToggle;

          spreadOnToggle(true);

          expect(store.setState).toHaveBeenCalledWith({ isDualViewEnabled: true });

      

          const spreadOnAdjust = createSpreadControlsMock.mock.calls[0][0].onAdjust;

          (store.getState as Mock).mockReturnValue({ spreadOffset: 0, favorites: [] });

          spreadOnAdjust();

          expect(store.setState).toHaveBeenCalledWith({ spreadOffset: 1 });

        });

      

        it('showResumeNotification should work', () => {

          uiManager.showResumeNotification(5);

          

          expect(createResumeNotification).toHaveBeenCalledWith(expect.objectContaining({

            savedIndex: 5

          }));

          expect(document.body.appendChild).toHaveBeenCalled();

      

          const createResumeNotificationMock = createResumeNotification as unknown as Mock<(props: ResumeNotificationProps) => { el: object }>;

          const onResume = createResumeNotificationMock.mock.calls[0][0].onResume;

          onResume();

          expect(navigator.jumpToPage).toHaveBeenCalledWith(6);

        });

      

        it('should handle skip in resume notification', () => {

          uiManager.showResumeNotification(5);

          const createResumeNotificationMock = createResumeNotification as unknown as Mock<(props: ResumeNotificationProps) => { el: object }>;

          const onSkip = createResumeNotificationMock.mock.calls[0][0].onSkip;

          onSkip();

        });

      

        it('should handle window resize', () => {

          uiManager.init();

          const addEventListenerMock = window.addEventListener as Mock;

          const calls = addEventListenerMock.mock.calls;

          const resizeCall = calls.find(c => c[0] === 'resize');

          expect(resizeCall).toBeDefined();

          const resizeHandler = resizeCall![1] as () => void;

          

              const clampSpy = vi.fn().mockReturnValue({ top: 100, left: 200 });

          

              // @ts-expect-error - accessing private property for testing

          

               

          

              uiManager.draggable = { clampToViewport: clampSpy } as any;

          

          resizeHandler();

          

          expect(clampSpy).toHaveBeenCalled();

          expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 100, left: 200 } });

        });

      

        it('navigation button callbacks should work', () => {

          uiManager.updateUI();

          const createNavigationButtonsMock = createNavigationButtons as unknown as Mock<(props: NavigationButtonsProps) => { elements: object[] }>;

          const callbacks = createNavigationButtonsMock.mock.calls[0][0];

          callbacks.onFirst();

          expect(navigator.scrollToEdge).toHaveBeenCalledWith('start');

          callbacks.onPrev();

          expect(navigator.scrollToImage).toHaveBeenCalledWith(-1);

          callbacks.onNext();

          expect(navigator.scrollToImage).toHaveBeenCalledWith(1);

          callbacks.onLast();

          expect(navigator.scrollToEdge).toHaveBeenCalledWith('end');

          callbacks.onInfo();

          expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });

          callbacks.onHelp();

          expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: true });

          callbacks.onSearch();

          expect(store.setState).toHaveBeenCalledWith({ isSearchModalOpen: true, searchResults: null });

          

                    vi.mocked(logic.pickRandomWork).mockReturnValue('http://lucky-url');
                    setupLocationMock('http://site.com/work/1');
                    callbacks.onLucky();
                    expect(logic.pickRandomWork).toHaveBeenCalled();
                    expect(window.location.href).toBe('http://lucky-url');
          
                  });
          
                  it('should toggle favorites when heart button is clicked', () => {
                    const mockMetadata = { title: 'Fav Manga', tags: [], relatedWorks: [] };
                    (store.getState as Mock).mockReturnValue({ 
                      enabled: true, 
                      isMetadataModalOpen: true, 
                      metadata: mockMetadata, 
                      favorites: [] 
                    });
                    uiManager.updateUI();
          
                    const createMetadataModalMock = createMetadataModal as unknown as Mock;
                    const { onToggleFavorite } = createMetadataModalMock.mock.calls[0][0];
          
                    // 1. Add to favorites
                    onToggleFavorite();
                    expect(store.setState).toHaveBeenCalledWith({
                      favorites: expect.arrayContaining([
                        expect.objectContaining({ title: 'Fav Manga' })
                      ])
                    });
          
                    // 2. Remove from favorites
                    const currentHref = window.location.href;
                    (store.getState as Mock).mockReturnValue({ 
                      enabled: true, 
                      isMetadataModalOpen: true, 
                      metadata: mockMetadata, 
                      favorites: [{ title: 'Fav Manga', href: currentHref, thumb: '' }] 
                    });
                              onToggleFavorite();
                              expect(store.setState).toHaveBeenCalledWith({ favorites: [] });
                            });
                    
                                    it('should toggle favorites from navigation button', () => {
                                      uiManager.updateUI();
                                      const createNavigationButtonsMock = createNavigationButtons as unknown as Mock;
                                      const { onToggleFavorite } = createNavigationButtonsMock.mock.calls[0][0];
                            
                                      (store.getState as Mock).mockReturnValue({ 
                                        enabled: true, 
                                        metadata: { title: 'Nav Fav' }, 
                                        favorites: [] 
                                      });
                                                          onToggleFavorite();
                              expect(store.setState).toHaveBeenCalledWith({
                                favorites: expect.arrayContaining([
                                  expect.objectContaining({ title: 'Nav Fav' })
                                ])
                              });
                            });
                          });
                    