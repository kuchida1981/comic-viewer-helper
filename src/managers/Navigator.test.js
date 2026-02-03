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
    revertToOriginal: vi.fn()
  };
});

describe('Navigator', () => {
  /** @type {any} */
  let adapter;
  /** @type {any} */
  let store;
  /** @type {any} */
  let navigator;
  /** @type {any} */
  let mockImages;

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
    mockImages[0].parentElement = parent;
    mockImages[1].parentElement = parent;
    
    navigator.scrollToImage(1);
    expect(mockImages[1].scrollIntoView).toHaveBeenCalled();
  });

  it('should scroll to edge', () => {
    navigator.scrollToEdge('start');
    expect(mockImages[0].scrollIntoView).toHaveBeenCalled();
    navigator.scrollToEdge('end');
    expect(mockImages[1].scrollIntoView).toHaveBeenCalled();
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

  });

  