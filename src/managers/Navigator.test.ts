import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { Navigator } from './Navigator.js';
import * as logic from '../logic.js';
import { Store, StoreListener } from '../store.js';
import { DefaultAdapter } from '../adapters/DefaultAdapter.js';
import { setupLocationMock } from '../test/mocks/dom.js';

// Mock logic functions to isolate Navigator logic
vi.mock('../logic.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logic.js')>();
  return {
    ...actual,
    fitImagesToViewport: vi.fn(),
    getPrimaryVisibleImageIndex: vi.fn().mockReturnValue(0),
    getImageElementByIndex: vi.fn((imgs: HTMLImageElement[], idx: number) => imgs[idx]),
    revertToOriginal: vi.fn(),
    forceImageLoad: vi.fn(),
    waitForImageLoad: vi.fn().mockResolvedValue(undefined),
    preloadImages: vi.fn(),
    pickRandomWork: vi.fn()
  };
});

describe('Navigator', () => {
  let adapter: typeof DefaultAdapter;
  let store: Store;
  let navigator: Navigator;
  let mockImages: HTMLImageElement[];

  beforeEach(() => {
    mockImages = [
      document.createElement('img'),
      document.createElement('img')
    ];
    mockImages[0].id = 'img1';
    mockImages[1].id = 'img2';

    // jsdom doesn't implement scrollIntoView
    mockImages.forEach(img => {
      img.scrollIntoView = vi.fn();
      Object.defineProperty(img, 'naturalHeight', { value: 100, writable: true });
      Object.defineProperty(img, 'complete', { value: true, writable: true });
      vi.spyOn(img, 'addEventListener');
      vi.spyOn(img, 'getAttribute');
      vi.spyOn(img, 'setAttribute');
    });

    adapter = {
      match: vi.fn().mockReturnValue(true),
      getContainer: vi.fn().mockReturnValue({ id: 'mock-container', style: {}, appendChild: vi.fn(), querySelectorAll: vi.fn().mockReturnValue([]) }),
      getImages: vi.fn().mockReturnValue(mockImages)
    } as unknown as typeof DefaultAdapter;
    
    store = {
      getState: vi.fn().mockReturnValue({ 
        enabled: true, 
        isDualViewEnabled: false, 
        spreadOffset: 0, 
        currentVisibleIndex: 0,
        isAutoplayEnabled: false,
        autoplayInterval: 5
      }),
      setState: vi.fn(),
      subscribe: vi.fn()
    } as unknown as Store;
    
    navigator = new Navigator(adapter, store);

    vi.stubGlobal('window', {
        innerHeight: 1000,
        requestAnimationFrame: vi.fn((cb: FrameRequestCallback) => { cb(0); return 1; }),
        cancelAnimationFrame: vi.fn()
    });
    vi.stubGlobal('requestAnimationFrame', vi.fn((cb: FrameRequestCallback) => { cb(0); return 1; }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should get images from adapter and cache them', () => {
    const imgs = navigator.getImages();
    expect(imgs).toEqual(mockImages);
    expect(adapter.getImages).toHaveBeenCalled();
    
    // Test caching
    (adapter.getImages as Mock).mockClear();
    navigator.getImages();
    expect(adapter.getImages).not.toHaveBeenCalled();
  });

  it('should update page counter', () => {
    navigator.updatePageCounter();
    expect(logic.getPrimaryVisibleImageIndex).toHaveBeenCalled();
    expect(store.setState).toHaveBeenCalled();
  });

  it('should not update page counter if disabled', () => {
    (store.getState as Mock).mockReturnValue({ enabled: false });
    navigator.updatePageCounter();
    expect(logic.getPrimaryVisibleImageIndex).not.toHaveBeenCalled();
  });

  it('should jump to page', async () => {
    const success = await navigator.jumpToPage(1);
    expect(success).toBe(true);
    expect(mockImages[0].scrollIntoView).toHaveBeenCalled();
  });

  it('should handle invalid page jump', async () => {
    vi.mocked(logic.getImageElementByIndex).mockReturnValue(null);
    const success = await navigator.jumpToPage(999);
    expect(success).toBe(false);
    expect(logic.getPrimaryVisibleImageIndex).toHaveBeenCalled();
  });

  it('should scroll to image', () => {
    void navigator.scrollToImage(1);
    expect(mockImages[1].scrollIntoView).toHaveBeenCalled();
  });

  it('should handle dual view scroll correctly', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isDualViewEnabled: true, currentVisibleIndex: 0 });
    
    const parent = document.createElement('div');
    parent.className = 'comic-row-wrapper';
    const parent2 = document.createElement('div');
    parent2.className = 'comic-row-wrapper';
    
    const img1 = document.createElement('img');
    const img2 = document.createElement('img');
    const img3 = document.createElement('img');
    const img4 = document.createElement('img');
    
    const imgs = [img1, img2, img3, img4];
    imgs.forEach(img => { 
      img.scrollIntoView = vi.fn();
      Object.defineProperty(img, 'complete', { value: true });
      Object.defineProperty(img, 'naturalHeight', { value: 100 });
    });

    parent.appendChild(img1);
    parent.appendChild(img2);
    parent2.appendChild(img3);
    parent2.appendChild(img4);
    
    (adapter.getImages as Mock).mockReturnValue(imgs);
    navigator = new Navigator(adapter, store);
    
    void navigator.scrollToImage(1);
    // Should skip index 1 and go to index 2 (next spread)
    expect(imgs[2].scrollIntoView).toHaveBeenCalled();
  });

  it('should scroll to edge (loaded images)', async () => {
    const spy = vi.spyOn(navigator, 'applyLayout');

    await navigator.scrollToEdge('start');
    expect(logic.forceImageLoad).toHaveBeenCalledWith(mockImages[0]);
    expect(spy).toHaveBeenCalledWith(0);
    expect(store.setState).not.toHaveBeenCalledWith({ isLoading: true });

    spy.mockClear();
    vi.mocked(logic.forceImageLoad).mockClear();

    await navigator.scrollToEdge('end');
    expect(logic.forceImageLoad).toHaveBeenCalledWith(mockImages[1]);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should scroll to edge (unloaded image - waits for load)', async () => {
    // Simulate the last image being unloaded
    Object.defineProperty(mockImages[1], 'complete', { value: false });
    Object.defineProperty(mockImages[1], 'naturalHeight', { value: 0 });

    const spy = vi.spyOn(navigator, 'applyLayout');

    await navigator.scrollToEdge('end');

    expect(logic.forceImageLoad).toHaveBeenCalledWith(mockImages[1]);
    expect(store.setState).toHaveBeenCalledWith({ isLoading: true });
    expect(logic.waitForImageLoad).toHaveBeenCalledWith(mockImages[1]);
    expect(spy).toHaveBeenCalledWith(1);
    expect(store.setState).toHaveBeenCalledWith({ isLoading: false });
  });

  it('should apply layout', () => {
    navigator.applyLayout();
    expect(logic.fitImagesToViewport).toHaveBeenCalled();
  });

  describe('Dynamic Preloading', () => {
    it('should use base preload count (5) in default mode', () => {
      (store.getState as Mock).mockReturnValue({
        enabled: true,
        isDualViewEnabled: false,
        isAutoplayEnabled: false,
        autoplayInterval: 5
      });
      navigator.updatePageCounter();
      expect(logic.preloadImages).toHaveBeenCalledWith(expect.anything(), expect.anything(), 5);
    });

    it('should double preload count (10) in dual view mode', () => {
      (store.getState as Mock).mockReturnValue({
        enabled: true,
        isDualViewEnabled: true,
        isAutoplayEnabled: false,
        autoplayInterval: 5
      });
      navigator.updatePageCounter();
      expect(logic.preloadImages).toHaveBeenCalledWith(expect.anything(), expect.anything(), 10);
    });

    it('should double preload count (10) during fast autoplay', () => {
      (store.getState as Mock).mockReturnValue({
        enabled: true,
        isDualViewEnabled: false,
        isAutoplayEnabled: true,
        autoplayInterval: 1
      });
      navigator.updatePageCounter();
      expect(logic.preloadImages).toHaveBeenCalledWith(expect.anything(), expect.anything(), 10);
    });

    it('should quadruple preload count (20) during fast autoplay in dual view mode', () => {
      (store.getState as Mock).mockReturnValue({
        enabled: true,
        isDualViewEnabled: true,
        isAutoplayEnabled: true,
        autoplayInterval: 1
      });
      navigator.updatePageCounter();
      expect(logic.preloadImages).toHaveBeenCalledWith(expect.anything(), expect.anything(), 20);
    });

    it('should use base count (5) during slow autoplay', () => {
      (store.getState as Mock).mockReturnValue({
        enabled: true,
        isDualViewEnabled: false,
        isAutoplayEnabled: true,
        autoplayInterval: 5
      });
      navigator.updatePageCounter();
      expect(logic.preloadImages).toHaveBeenCalledWith(expect.anything(), expect.anything(), 5);
    });
  });

  it('should revert when disabled via applyLayout', () => {
    vi.mocked(store.getState).mockReturnValue({ 
      enabled: false,
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      metadata: { title: '', tags: [], relatedWorks: [] },
      isMetadataModalOpen: false,
      isHelpModalOpen: false,
      isSearchModalOpen: false,
      isFavoritesModalOpen: false,
      isLoading: false,
      isLuckyLoading: false,
      searchResults: null,
      searchQuery: '',
      searchCache: null,
      searchHistory: [],
      luckyHistory: [],
      favorites: [],
      pinnedTags: [],
      guiPos: null,
      isAutoplayEnabled: false,
      autoplayInterval: 5,
      syncConfig: null,
      syncLastError: null
    });
    navigator.applyLayout();
    expect(logic.revertToOriginal).toHaveBeenCalled();
  });

    it('init should handle image load listeners', () => {
      const spy = vi.spyOn(navigator, 'applyLayout');
      Object.defineProperty(mockImages[0], 'complete', { value: false });

      navigator.init();

      expect(mockImages[0].addEventListener).toHaveBeenCalledWith('load', expect.any(Function));

      // Trigger load
      const addEventListenerMock = mockImages[0].addEventListener as Mock;
      const loadCb = addEventListenerMock.mock.calls[0][1] as EventListener;
      loadCb({} as Event);

      expect(spy).toHaveBeenCalled();
    });
  
    it('should react to store changes after init', () => {
      navigator.init();
      const spy = vi.spyOn(navigator, 'applyLayout');
      
      // Simulate store update
      const subscribeMock = store.subscribe as Mock;
      const subscribeCb = subscribeMock.mock.calls[0][0] as StoreListener;
      subscribeCb({ 
        enabled: true, 
        isDualViewEnabled: true, 
        spreadOffset: 0, 
        currentVisibleIndex: 0,
        metadata: { title: '', tags: [], relatedWorks: [] },
        isMetadataModalOpen: false,
        isHelpModalOpen: false,
        isSearchModalOpen: false,
        isFavoritesModalOpen: false,
        isLoading: false,
        isLuckyLoading: false,
        searchResults: null,
        searchQuery: '',
        searchCache: null,
        searchHistory: [],
        luckyHistory: [],
        favorites: [],
        pinnedTags: [],
        guiPos: null,
        isAutoplayEnabled: false,
        autoplayInterval: 5,
        syncConfig: null,
      syncLastError: null
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should open metadata modal when navigating past last page in dual view spread', () => {
        (store.getState as Mock).mockReturnValue({ 
          enabled: true, 
          isDualViewEnabled: true, 
          isMetadataModalOpen: false,
          currentVisibleIndex: 1 
        });
    
        const parent = document.createElement('div');
        parent.className = 'comic-row-wrapper';
        
        // 3 images. Index 1 and 2 are a spread.
        const img1 = document.createElement('img');
        const img2 = document.createElement('img');
        const img3 = document.createElement('img');
        
        const imgs = [img1, img2, img3];
        imgs.forEach(img => { 
          img.scrollIntoView = vi.fn();
          Object.defineProperty(img, 'complete', { value: true });
          Object.defineProperty(img, 'naturalHeight', { value: 100 });
        });
        
        parent.appendChild(img2);
        parent.appendChild(img3);
        
        // Mock getImages to return 3 images
        (adapter.getImages as Mock).mockReturnValue(imgs);
        navigator = new Navigator(adapter, store);

        // Mock visible index to be 1
        vi.mocked(logic.getPrimaryVisibleImageIndex).mockReturnValue(1);
    
            void navigator.scrollToImage(1);
            
            expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });
            // Should NOT scroll to any image (early return)
            expect(imgs[2].scrollIntoView).not.toHaveBeenCalled();
          });
        
          describe('Autoplay', () => {
            beforeEach(() => {
              vi.useFakeTimers();
            });
        
            afterEach(() => {
              vi.useRealTimers();
            });
        
            it('should start autoplay when enabled in store', () => {
              navigator.init();
              const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];
        
              subscribeCb({
                ...vi.mocked(store.getState)(),
                isAutoplayEnabled: true,
                autoplayInterval: 1
              });
        
              expect(vi.getTimerCount()).toBe(1);
              
              vi.advanceTimersByTime(1000);
              expect(logic.getPrimaryVisibleImageIndex).toHaveBeenCalled();
            });

            it('should start autoplay automatically if enabled in initial state', () => {
              (store.getState as Mock).mockReturnValue({
                ...vi.mocked(store.getState)(),
                isAutoplayEnabled: true,
                autoplayInterval: 5
              });
              
              vi.clearAllTimers();
              navigator.init();
              // Expect at least 1 timer (autoplay), but ignore RAF timers if any
              expect(vi.getTimerCount()).toBeGreaterThanOrEqual(1);
            });

            it('should NOT start autoplay automatically if isAutoplayEnabled is true but enabled is false', () => {
              (store.getState as Mock).mockReturnValue({
                ...vi.mocked(store.getState)(),
                enabled: false,
                isAutoplayEnabled: true,
                autoplayInterval: 5
              });
              
              vi.clearAllTimers();
              navigator.init();
              // Autoplay timer should not be started, but RAF might still be present
              // Wait for a tick to ensure no async start occurs
              vi.runAllTicks();
              // We expect no autoplay timer, but RAF might be counted.
              // We rely on the logic that only _startAutoplay uses setTimeout in this class.
              expect(vi.getTimerCount()).toBe(0); 
            });
        
                        it('should stop autoplay when disabled in store', () => {
                          // Start with disabled
                          (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: false });
                          navigator.init();
                          const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];
                    
                          // Enable
                          vi.clearAllTimers();
                          (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: true, autoplayInterval: 1 });
                          subscribeCb(vi.mocked(store.getState)());
                          const timerCount = vi.getTimerCount();
                          expect(timerCount).toBeGreaterThan(0);
                    
                          // Disable
                          (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: false, autoplayInterval: 1 });
                          subscribeCb(vi.mocked(store.getState)());
                          expect(vi.getTimerCount()).toBe(timerCount - 1);
                        });
                    
                        it('should reset timer when manual navigation occurs', () => {
                          (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: true, autoplayInterval: 5 });
                          navigator.init();
                    
                                vi.clearAllTimers();
                                (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: true, autoplayInterval: 5 });
                                // Trigger a start
                                void navigator.scrollToImage(1); // scrollToImage calls _resetAutoplayTimer
                                const initialCount = vi.getTimerCount();
                          
                                void navigator.scrollToImage(1);
                          
                                // Timer should have been reset (cleared and restarted)
                                expect(vi.getTimerCount()).toBe(initialCount);
                              });
                          
                              it('should attempt random jump at the last page and stop if no candidates', async () => {
                                (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: false });
                                navigator.init();
                                const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];
                          
                                // 最終ページに設定
                                vi.mocked(logic.getPrimaryVisibleImageIndex).mockReturnValue(mockImages.length - 1);
                                // ジャンプ候補なし
                                vi.mocked(logic.pickRandomWork).mockReturnValue(null);
                                setupLocationMock('current-url');
                          
                                // 有効化してタイマー開始
                                vi.clearAllTimers();
                                (store.getState as Mock).mockReturnValue({ 
                                  ...vi.mocked(store.getState)(), 
                                  isAutoplayEnabled: true, 
                                  autoplayInterval: 1,
                                  luckyHistory: []
                                });
                                subscribeCb(vi.mocked(store.getState)());
                                
                                vi.advanceTimersByTime(1000);
                                // Wait for async task inside setTimeout
                                vi.runAllTicks();
                                
                                expect(logic.pickRandomWork).toHaveBeenCalled();
                                // 仕様変更: isAutoplayEnabled: false はセットせず、タイマーだけ止める
                                expect(store.setState).not.toHaveBeenCalledWith({ isAutoplayEnabled: false });
                                expect(vi.getTimerCount()).toBe(0);
                              });

                              it('should attempt random jump at the last page and continue if jump occurs', async () => {
                                (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: false });
                                navigator.init();
                                const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];
                          
                                // 最終ページに設定
                                vi.mocked(logic.getPrimaryVisibleImageIndex).mockReturnValue(mockImages.length - 1);
                                // ジャンプ成功
                                vi.mocked(logic.pickRandomWork).mockReturnValue('http://new-url');
                                setupLocationMock('current-url');
                          
                                // 有効化してタイマー開始
                                vi.clearAllTimers();
                                (store.getState as Mock).mockReturnValue({ 
                                  ...vi.mocked(store.getState)(), 
                                  isAutoplayEnabled: true, 
                                  autoplayInterval: 1,
                                  luckyHistory: []
                                });
                                subscribeCb(vi.mocked(store.getState)());
                                
                                vi.advanceTimersByTime(1000);
                                // Wait for async task inside setTimeout
                                vi.runAllTicks();
                                
                                expect(logic.pickRandomWork).toHaveBeenCalled();
                                expect(window.location.href).toBe('http://new-url');
                                // Should NOT set isAutoplayEnabled to false
                                expect(store.setState).not.toHaveBeenCalledWith({ isAutoplayEnabled: false });
                              });
                          
                              it('should continue autoplay after successful scroll', async () => {
                                (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: false });
                                navigator.init();
                                const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];
                          
                                // Enable and set to middle page
                                vi.mocked(logic.getPrimaryVisibleImageIndex).mockReturnValue(0);
                                vi.clearAllTimers();
                                (store.getState as Mock).mockReturnValue({ ...vi.mocked(store.getState)(), isAutoplayEnabled: true, autoplayInterval: 1 });
                                subscribeCb(vi.mocked(store.getState)());
                          
                                // Trigger first tick
                                vi.advanceTimersByTime(1000);
                                vi.runAllTicks();
                          
                                // Should have scrolled
                                expect(logic.getPrimaryVisibleImageIndex).toHaveBeenCalled();                                
                                // Should have set a NEW timer for the next page
                                expect(vi.getTimerCount()).toBeGreaterThan(0);
                              });

                              it('should suspend autoplay when a modal is open and resume when closed', () => {
                                (store.getState as Mock).mockReturnValue({ 
                                  ...vi.mocked(store.getState)(), 
                                  isAutoplayEnabled: true, 
                                  autoplayInterval: 1,
                                  isSearchModalOpen: false,
                                  isHelpModalOpen: false,
                                  isMetadataModalOpen: false
                                });
                                navigator.init();
                                const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];

                                // 最初はタイマーが動いている
                                const initialTimers = vi.getTimerCount();
                                expect(initialTimers).toBeGreaterThan(0);

                                // 検索モーダルを開く
                                (store.getState as Mock).mockReturnValue({ 
                                  ...vi.mocked(store.getState)(), 
                                  isSearchModalOpen: true 
                                });
                                subscribeCb(vi.mocked(store.getState)());

                                // オートプレイタイマーが止まるはず（タイマー数が減少する）
                                expect(vi.getTimerCount()).toBeLessThan(initialTimers);

                                // 検索モーダルを閉じる
                                (store.getState as Mock).mockReturnValue({ 
                                  ...vi.mocked(store.getState)(), 
                                  isSearchModalOpen: false 
                                });
                                subscribeCb(vi.mocked(store.getState)());

                                // タイマーが再開するはず
                                expect(vi.getTimerCount()).toBe(initialTimers);
                              });
                            });
                          });