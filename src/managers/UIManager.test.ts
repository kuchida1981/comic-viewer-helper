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
import { Store } from '../store.js';
import { Navigator } from './Navigator.js';
import { DefaultAdapter } from '../adapters/DefaultAdapter.js';
import * as logic from '../logic.js';

// Mock logic
vi.mock('../logic.js', async () => {
  const actual = await vi.importActual('../logic.js') as any;
  return {
    ...actual,
    jumpToRandomWork: vi.fn()
  };
});

// Mock components
vi.mock('../ui/styles.js', () => ({ injectStyles: vi.fn() }));
vi.mock('../ui/utils.js', () => ({ 
  createElement: vi.fn()
}));
vi.mock('../ui/Draggable.js', () => ({
  Draggable: vi.fn().mockImplementation(function() {
    return {
      clampToViewport: vi.fn().mockReturnValue({ top: 20, left: 30 }),
      destroy: vi.fn()
    };
  })
}));
vi.mock('../ui/components/PowerButton.js', () => ({
  createPowerButton: vi.fn(() => ({ el: { style: {}, appendChild: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/PageCounter.js', () => ({
  createPageCounter: vi.fn(() => ({ 
    el: { style: {}, display: '' }, 
    update: vi.fn(), 
    input: { blur: vi.fn(), style: {} } 
  }))
}));
vi.mock('../ui/components/SpreadControls.js', () => ({
  createSpreadControls: vi.fn(() => ({ el: { style: {}, display: '' }, update: vi.fn() }))
}));
vi.mock('../ui/components/ResumeNotification.js', () => ({
  createResumeNotification: vi.fn(() => ({ el: { style: {}, display: '' } }))
}));
vi.mock('../ui/components/LoadingIndicator.js', () => ({
  createLoadingIndicator: vi.fn(() => ({ el: { style: {}, display: '' }, update: vi.fn() }))
}));
vi.mock('../ui/components/NavigationButtons.js', () => ({
  createNavigationButtons: vi.fn(() => ({ elements: [{ style: {}, querySelectorAll: vi.fn() }], update: vi.fn() }))
}));
vi.mock('../ui/components/MetadataModal.js', () => ({
  createMetadataModal: vi.fn(() => ({ el: { style: {}, remove: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/HelpModal.js', () => ({
  createHelpModal: vi.fn(() => ({ el: { style: {}, remove: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/SearchModal.js', () => ({
  createSearchModal: vi.fn(() => ({ el: { style: {}, remove: vi.fn() }, input: {}, updateResults: vi.fn(), setUpdating: vi.fn() }))
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
    adapter = { 
      match: vi.fn().mockReturnValue(true),
      getContainer: vi.fn().mockReturnValue(null), // Default to null for container check
      getImages: vi.fn().mockReturnValue([])
    } as unknown as typeof DefaultAdapter;
    
    store = {
      getState: vi.fn().mockReturnValue({ 
        enabled: true, 
        isDualViewEnabled: false, 
        guiPos: { top: 10, left: 10 },
        currentVisibleIndex: 0,
        metadata: {},
        isMetadataModalOpen: false,
        isHelpModalOpen: false,
        isSearchModalOpen: false,
        spreadOffset: 0,
        isLoading: false,
        searchResults: null,
        searchQuery: '',
        searchCache: null
      }),
      setState: vi.fn(),
      subscribe: vi.fn()
    } as unknown as Store;
    
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

    vi.stubGlobal('window', { addEventListener: vi.fn(), innerWidth: 1000, innerHeight: 1000 });
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
    (store.getState as Mock).mockReturnValue({ enabled: false, metadata: {}, isMetadataModalOpen: false, isHelpModalOpen: false, currentVisibleIndex: 0 });
    uiManager.updateUI();
    expect(mockBtn.style.display).toBe('none');
    
    // Enabled
    (store.getState as Mock).mockReturnValue({ enabled: true, metadata: {}, isMetadataModalOpen: false, isHelpModalOpen: false, currentVisibleIndex: 0 });
    uiManager.updateUI();
    expect(mockBtn.style.display).toBe('inline-block');
  });

  it('should handle modals and their onClose callbacks', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: true, isHelpModalOpen: true, isSearchModalOpen: true, metadata: {}, currentVisibleIndex: 0, searchResults: null });
    uiManager.updateUI();
    
    // Test onClose
    (createHelpModal as unknown as Mock).mock.calls[0][0].onClose();
    expect(store.setState).toHaveBeenCalledWith({ isHelpModalOpen: false });

    (createMetadataModal as unknown as Mock).mock.calls[0][0].onClose();
    expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: false });

    (createSearchModal as unknown as Mock).mock.calls[0][0].onClose();
    expect(store.setState).toHaveBeenCalledWith({ isSearchModalOpen: false });
    
    // Close modals in state and update UI
    (store.getState as Mock).mockReturnValue({ enabled: true, isMetadataModalOpen: false, isHelpModalOpen: false, isSearchModalOpen: false, metadata: {}, currentVisibleIndex: 0, searchResults: null });
    uiManager.updateUI();
  });

  it('should handle search modal fetch and parse', async () => {
    const mockResults = { results: [{ title: 'A', href: '/a', thumb: '/a.jpg' }], totalCount: '1件', nextPageUrl: null };
    adapter.getSearchUrl = vi.fn().mockReturnValue('http://search.com?q=test');
    adapter.parseSearchResults = vi.fn().mockReturnValue(mockResults);

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('<html></html>') });
    vi.stubGlobal('fetch', fetchMock);

    (store.getState as Mock).mockReturnValue({ enabled: true, isSearchModalOpen: true, metadata: {}, currentVisibleIndex: 0, searchResults: null });
    uiManager.updateUI();

    const onSearch = (createSearchModal as unknown as Mock).mock.calls[0][0].onSearch;
    onSearch('test');

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
      searchResults: mockResults,
      searchCache: {
        query: 'test',
        results: mockResults,
        fetchedAt: expect.any(Number)
      }
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
      metadata: {}, 
      currentVisibleIndex: 0, 
      searchResults: null,
      searchQuery: 'test',
      searchCache: oldCache
    });
    
    uiManager.updateUI();

    // Should show cache immediately
    expect(store.setState).toHaveBeenCalledWith({ searchResults: oldCache.results });
    expect(createSearchModal).toHaveBeenCalled();
    const modal = (createSearchModal as unknown as Mock).mock.results[0].value;
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

  it('should handle resize for draggable', () => {
    uiManager.init();
    const calls = (window.addEventListener as unknown as Mock).mock.calls;
    const resizeCall = calls.find(c => c[0] === 'resize');
    if (!resizeCall) throw new Error('Resize listener not found');
    const resizeCb = resizeCall[1];
    
    // @ts-expect-error - accessing private property
    uiManager.draggable = { clampToViewport: vi.fn().mockReturnValue({ top: 50, left: 50 }) };
    resizeCb();
    expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 50, left: 50 } });
  });

  it('onDragEnd should update store', () => {
    uiManager.updateUI();
    const onDragEnd = (Draggable as unknown as Mock).mock.calls[0][1].onDragEnd;
    onDragEnd(100, 200);
    expect(store.setState).toHaveBeenCalledWith({ guiPos: { top: 100, left: 200 } });
  });

  it('component callbacks should work', () => {
    uiManager.updateUI();
    
    const powerOnClick = (createPowerButton as unknown as Mock).mock.calls[0][0].onClick;
    (store.getState as Mock).mockReturnValue({ enabled: true });
    powerOnClick();
    expect(store.setState).toHaveBeenCalledWith({ enabled: false });

    const counterOnJump = (createPageCounter as unknown as Mock).mock.calls[0][0].onJump;
    counterOnJump('5');
    expect(navigator.jumpToPage).toHaveBeenCalledWith('5');

    const spreadOnToggle = (createSpreadControls as unknown as Mock).mock.calls[0][0].onToggle;
    spreadOnToggle(true);
    expect(store.setState).toHaveBeenCalledWith({ isDualViewEnabled: true });

    const spreadOnAdjust = (createSpreadControls as unknown as Mock).mock.calls[0][0].onAdjust;
    (store.getState as Mock).mockReturnValue({ spreadOffset: 0 });
    spreadOnAdjust();
    expect(store.setState).toHaveBeenCalledWith({ spreadOffset: 1 });
  });

  it('showResumeNotification should work', () => {
    uiManager.showResumeNotification(5);
    
    expect(createResumeNotification).toHaveBeenCalledWith(expect.objectContaining({
      savedIndex: 5
    }));
    expect(document.body.appendChild).toHaveBeenCalled();

    const onResume = (createResumeNotification as unknown as Mock).mock.calls[0][0].onResume;
    onResume();
    expect(navigator.jumpToPage).toHaveBeenCalledWith(6);
  });

  it('navigation button callbacks should work', () => {
    uiManager.updateUI();
    const callbacks = (createNavigationButtons as unknown as Mock).mock.calls[0][0];
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
            expect(store.setState).toHaveBeenCalledWith({ isSearchModalOpen: true });
            
            callbacks.onLucky();
            expect(logic.jumpToRandomWork).toHaveBeenCalled();
          });
        });
        