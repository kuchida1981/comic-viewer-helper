import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { Navigator } from './Navigator.js';
import * as logic from '../logic.js';
import { Store } from '../store.js';
import { DefaultAdapter } from '../adapters/DefaultAdapter.js';

// Mock logic functions to isolate Navigator logic
vi.mock('../logic.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../logic.js')>();
  return {
    ...actual,
    fitImagesToViewport: vi.fn(),
    getPrimaryVisibleImageIndex: vi.fn().mockReturnValue(0),
    getImageElementByIndex: vi.fn((imgs, idx) => imgs[idx]),
    revertToOriginal: vi.fn(),
    forceImageLoad: vi.fn(),
    waitForImageLoad: vi.fn().mockResolvedValue(undefined),
    preloadImages: vi.fn()
  };
});

describe('Navigator', () => {
  let adapter: typeof DefaultAdapter;
  let store: Store;
  let navigator: Navigator;
  let mockImages: HTMLImageElement[];

  beforeEach(() => {
    mockImages = [
      { 
        id: 'img1', 
        scrollIntoView: vi.fn(), 
        parentElement: { classList: { contains: () => false } }, 
        complete: true, 
        naturalHeight: 100,
        addEventListener: vi.fn(), 
        getAttribute: vi.fn().mockReturnValue(null),
        setAttribute: vi.fn()
      } as unknown as HTMLImageElement,
      { 
        id: 'img2', 
        scrollIntoView: vi.fn(), 
        parentElement: { classList: { contains: () => false } }, 
        complete: true, 
        naturalHeight: 100,
        addEventListener: vi.fn(), 
        getAttribute: vi.fn().mockReturnValue(null),
        setAttribute: vi.fn()
      } as unknown as HTMLImageElement
    ];

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
        currentVisibleIndex: 0 
      }),
      setState: vi.fn(),
      subscribe: vi.fn()
    } as unknown as Store;
    
    navigator = new Navigator(adapter, store);

    vi.stubGlobal('window', {
        innerHeight: 1000,
        requestAnimationFrame: vi.fn(cb => cb(0)),
        cancelAnimationFrame: vi.fn()
    });
    vi.stubGlobal('requestAnimationFrame', vi.fn(cb => cb(0)));
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
    navigator.scrollToImage(1);
    expect(mockImages[1].scrollIntoView).toHaveBeenCalled();
  });

  it('should handle dual view scroll correctly', () => {
    (store.getState as Mock).mockReturnValue({ enabled: true, isDualViewEnabled: true, currentVisibleIndex: 0 });
    // Mock same parent and row wrapper class
    const parent = { classList: { contains: vi.fn().mockReturnValue(true) } } as unknown as HTMLElement;
    const parent2 = { classList: { contains: vi.fn().mockReturnValue(true) } } as unknown as HTMLElement;
    
    const imgs = [
        { ...mockImages[0], parentElement: parent },
        { ...mockImages[1], parentElement: parent },
        { ...mockImages[0], id: 'img3', parentElement: parent2 },
        { ...mockImages[1], id: 'img4', parentElement: parent2 }
    ] as unknown as HTMLImageElement[];
    
    (adapter.getImages as Mock).mockReturnValue(imgs);
    // Re-initialize to bust cache or mock getImages correctly if cache logic uses it
    // Navigator usually caches, so we might need to recreate navigator or force clear cache.
    // Based on implementation, getImages() caches.
    // Let's create a new navigator instance for this test to be safe with new adapter return
    navigator = new Navigator(adapter, store);
    
    navigator.scrollToImage(1);
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
    // @ts-expect-error - writing to readonly property
    mockImages[1].complete = false;
    // @ts-expect-error - writing to readonly property
    mockImages[1].naturalHeight = 0;

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

  it('should revert when disabled via applyLayout', () => {
    (store.getState as Mock).mockReturnValue({ enabled: false });
    navigator.applyLayout();
    expect(logic.revertToOriginal).toHaveBeenCalled();
  });

    it('init should handle image load listeners', () => {
      const spy = vi.spyOn(navigator, 'applyLayout');
      // @ts-expect-error - writing to readonly property
      mockImages[0].complete = false;

      navigator.init();

      expect(mockImages[0].addEventListener).toHaveBeenCalledWith('load', expect.any(Function));

      // Trigger load
      const loadCb = (mockImages[0].addEventListener as Mock).mock.calls[0][1];
      loadCb();

      expect(spy).toHaveBeenCalled();
    });
  
    it('should react to store changes after init', () => {
      navigator.init();
      const spy = vi.spyOn(navigator, 'applyLayout');
      
      // Simulate store update
      const subscribeCb = (store.subscribe as Mock).mock.calls[0][0];
      subscribeCb({ enabled: true, isDualViewEnabled: true, spreadOffset: 0 });
      
      expect(spy).toHaveBeenCalled();
    });

    it('should open metadata modal when navigating past last page in dual view spread', () => {
        (store.getState as Mock).mockReturnValue({ 
          enabled: true, 
          isDualViewEnabled: true, 
          isMetadataModalOpen: false,
          currentVisibleIndex: 1 
        });
    
        const parent = { classList: { contains: vi.fn().mockReturnValue(true) } } as unknown as HTMLElement;
        
        // 3 images. Index 1 and 2 are a spread.
        const imgs = [
            { ...mockImages[0] }, // index 0
            { ...mockImages[0], parentElement: parent }, // index 1
            { ...mockImages[0], parentElement: parent }  // index 2
        ] as unknown as HTMLImageElement[];
        
        // Mock getImages to return 3 images
        (adapter.getImages as Mock).mockReturnValue(imgs);
        navigator = new Navigator(adapter, store);

        // Mock visible index to be 1
        vi.mocked(logic.getPrimaryVisibleImageIndex).mockReturnValue(1);
    
        navigator.scrollToImage(1);
    
        expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });
        // Should NOT scroll to any image (early return)
        expect(imgs[2].scrollIntoView).not.toHaveBeenCalled();
      });
});
