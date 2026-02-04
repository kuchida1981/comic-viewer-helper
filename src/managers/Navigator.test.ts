// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Navigator } from './Navigator';
import * as logic from '../logic';

// Mock logic functions to isolate Navigator logic
vi.mock('../logic', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(/** @type {Object} */ (actual)),
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
  /** @type {any} */
  let adapter: any;
  /** @type {any} */
  let store: any;
  /** @type {any} */
  let navigator: any;
  /** @type {any} */
  let mockImages: any;

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
      },
      { 
        id: 'img2', 
        scrollIntoView: vi.fn(), 
        parentElement: { classList: { contains: () => false } }, 
        complete: true, 
        naturalHeight: 100,
        addEventListener: vi.fn(),
        getAttribute: vi.fn().mockReturnValue(null),
        setAttribute: vi.fn()
      }
    ];

    adapter = {
      match: vi.fn().mockReturnValue(true),
      getContainer: vi.fn().mockReturnValue({ id: 'mock-container', style: {}, appendChild: vi.fn(), querySelectorAll: vi.fn().mockReturnValue([]) }),
      getImages: vi.fn().mockReturnValue(mockImages)
    };
    
    store = {
      getState: vi.fn().mockReturnValue({ 
        enabled: true, 
        isDualViewEnabled: false, 
        spreadOffset: 0, 
        currentVisibleIndex: 0 
      }),
      setState: vi.fn(),
      subscribe: vi.fn()
    };
    
    navigator = new Navigator(/** @type {any} */ (adapter), /** @type {any} */ (store));

    vi.stubGlobal('window', {
        innerHeight: 1000,
        requestAnimationFrame: vi.fn(cb => cb()),
        cancelAnimationFrame: vi.fn()
    });
    vi.stubGlobal('requestAnimationFrame', vi.fn(cb => cb()));
    // Don't stub document globally, use real one but spy if needed
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
    adapter.getImages.mockClear();
    navigator.getImages();
    expect(adapter.getImages).not.toHaveBeenCalled();
  });

  it('should update page counter', () => {
    navigator.updatePageCounter();
    expect(logic.getPrimaryVisibleImageIndex).toHaveBeenCalled();
    expect(store.setState).toHaveBeenCalled();
  });

  it('should not update page counter if disabled', () => {
    store.getState.mockReturnValue({ enabled: false });
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
    store.getState.mockReturnValue({ enabled: true, isDualViewEnabled: true, currentVisibleIndex: 0 });
    // Mock same parent and row wrapper class
    const parent = { classList: { contains: vi.fn().mockReturnValue(true) } };
    const parent2 = { classList: { contains: vi.fn().mockReturnValue(true) } };
    
    const imgs = [
        { ...mockImages[0], parentElement: parent },
        { ...mockImages[1], parentElement: parent },
        { ...mockImages[0], id: 'img3', parentElement: parent2 },
        { ...mockImages[1], id: 'img4', parentElement: parent2 }
    ];
    
    adapter.getImages.mockReturnValue(imgs);
    
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
    mockImages[1].complete = false;
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
    store.getState.mockReturnValue({ enabled: false });
    navigator.applyLayout();
    expect(logic.revertToOriginal).toHaveBeenCalled();
  });

    it('init should handle image load listeners', () => {

      const spy = vi.spyOn(navigator, 'applyLayout');

      mockImages[0].complete = false;

      navigator.init();

      expect(mockImages[0].addEventListener).toHaveBeenCalledWith('load', expect.any(Function));

      

      // Trigger load

      const loadCb = mockImages[0].addEventListener.mock.calls[0][1];

      loadCb();

      expect(spy).toHaveBeenCalled();

    });

  

    it('should react to store changes after init', () => {

      navigator.init();

      const spy = vi.spyOn(navigator, 'applyLayout');

      

      // Simulate store update

      const subscribeCb = vi.mocked(store.subscribe).mock.calls[0][0];

      subscribeCb({ enabled: true, isDualViewEnabled: true, spreadOffset: 0 });

      

      expect(spy).toHaveBeenCalled();

    });

    it('should open metadata modal when navigating past last page in dual view spread', () => {
        store.getState.mockReturnValue({ 
          enabled: true, 
          isDualViewEnabled: true, 
          isMetadataModalOpen: false,
          currentVisibleIndex: 1 
        });
    
        const parent = { classList: { contains: vi.fn().mockReturnValue(true) } };
        
        // 3 images. Index 1 and 2 are a spread.
        const imgs = [
            { ...mockImages[0] }, // index 0
            { ...mockImages[0], parentElement: parent }, // index 1
            { ...mockImages[0], parentElement: parent }  // index 2
        ];
        
        // Mock getImages to return 3 images
        adapter.getImages.mockReturnValue(imgs);
        // Mock visible index to be 1
        vi.mocked(logic.getPrimaryVisibleImageIndex).mockReturnValue(1);
    
        navigator.scrollToImage(1);
    
        expect(store.setState).toHaveBeenCalledWith({ isMetadataModalOpen: true });
        // Should NOT scroll to any image (early return)
        expect(imgs[2].scrollIntoView).not.toHaveBeenCalled();
      });

  });

  