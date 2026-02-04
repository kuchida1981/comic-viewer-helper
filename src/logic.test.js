import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateVisibleHeight, shouldPairWithNext, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, fitImagesToViewport, getNavigationDirection, waitForImageLoad, preloadImages, getClickNavigationDirection } from './logic';

describe('logic.js', () => {
  describe('waitForImageLoad', () => {
    it('should resolve immediately if image is already complete and has height', async () => {
      const img = { complete: true, naturalHeight: 100 };
      // @ts-ignore
      await expect(waitForImageLoad(img)).resolves.toBeUndefined();
    });

    it('should resolve when load event fires', async () => {
      /** @type {any} */
      const listeners = {};
      const img = { 
        complete: false,
        addEventListener: vi.fn((event, cb) => { listeners[event] = cb; }),
        removeEventListener: vi.fn()
      };

      // @ts-ignore
      const promise = waitForImageLoad(img);
      listeners['load']();
      await expect(promise).resolves.toBeUndefined();
      expect(img.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('should resolve when error event fires', async () => {
      /** @type {any} */
      const listeners = {};
      const img = { 
        complete: false,
        addEventListener: vi.fn((event, cb) => { listeners[event] = cb; }),
        removeEventListener: vi.fn()
      };

      // @ts-ignore
      const promise = waitForImageLoad(img);
      listeners['error']();
      await expect(promise).resolves.toBeUndefined();
    });

    it('should resolve on timeout', async () => {
      vi.useFakeTimers();
      const img = { 
        complete: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      };

      // @ts-ignore
      const promise = waitForImageLoad(img, 1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe('preloadImages', () => {
    it('should trigger decode for next images', () => {
      const images = Array.from({ length: 5 }, () => ({
        complete: false,
        loading: 'lazy',
        decode: vi.fn().mockResolvedValue(undefined)
      }));
      
      // @ts-ignore
      preloadImages(images, 0, 2);
      
      expect(images[1].loading).toBe('eager');
      expect(images[1].decode).toHaveBeenCalled();
      expect(images[2].loading).toBe('eager');
      expect(images[2].decode).toHaveBeenCalled();
      expect(images[3].loading).toBe('lazy'); // Out of range
    });

    it('should handle images without decode method', () => {
      const images = Array.from({ length: 3 }, () => ({
        complete: false,
        loading: 'lazy'
      }));
      
      // @ts-ignore
      preloadImages(images, 0, 1);
      
      expect(images[1].loading).toBe('eager');
    });

    it('should skip already complete images', () => {
      const images = [
        { complete: true, loading: 'lazy', decode: vi.fn() },
        { complete: true, loading: 'lazy', decode: vi.fn() }
      ];
      
      // @ts-ignore
      preloadImages(images, 0, 1);
      
      expect(images[1].loading).toBe('lazy');
      expect(images[1].decode).not.toHaveBeenCalled();
    });

    it('should preload previous images', () => {
      const images = Array.from({ length: 5 }, () => ({
        complete: false,
        loading: 'lazy',
        decode: vi.fn().mockResolvedValue(undefined)
      }));
      
      // @ts-ignore
      preloadImages(images, 2, 1);
      
      expect(images[1].loading).toBe('eager'); // Previous
      expect(images[3].loading).toBe('eager'); // Next
    });
  });

  describe('calculateVisibleHeight', () => {

    it('should return full height when image is fully in viewport', () => {
      const rect = { top: 100, bottom: 500 };
      const windowHeight = 1000;
      expect(calculateVisibleHeight(rect, windowHeight)).toBe(400);
    });

    it('should return partial height when image is partially at top', () => {
      const rect = { top: -100, bottom: 200 };
      const windowHeight = 1000;
      expect(calculateVisibleHeight(rect, windowHeight)).toBe(200);
    });

    it('should return partial height when image is partially at bottom', () => {
      const rect = { top: 800, bottom: 1200 };
      const windowHeight = 1000;
      expect(calculateVisibleHeight(rect, windowHeight)).toBe(200);
    });

    it('should return 0 when image is completely out of viewport', () => {
      const rect = { top: 1100, bottom: 1500 };
      const windowHeight = 1000;
      expect(calculateVisibleHeight(rect, windowHeight)).toBe(0);
    });
  });

  describe('shouldPairWithNext', () => {
    it('should return true for normal dual view pairing', () => {
      const current = { isLandscape: false };
      const next = { isLandscape: false };
      expect(shouldPairWithNext(current, next, true)).toBe(true);
    });

    it('should return false if dual view is disabled', () => {
      const current = { isLandscape: false };
      const next = { isLandscape: false };
      expect(shouldPairWithNext(current, next, false)).toBe(false);
    });

    it('should return false if current is landscape', () => {
      const current = { isLandscape: true };
      const next = { isLandscape: false };
      expect(shouldPairWithNext(current, next, true)).toBe(false);
    });
    it('should return false if next is null', () => {
      const current = { isLandscape: false };
      expect(shouldPairWithNext(current, null, true)).toBe(false);
    });
  });

  describe('getPrimaryVisibleImageIndex', () => {
    it('should return the index of the image with most visible height', () => {
      const imgs = [
        { getBoundingClientRect: () => ({ top: -100, bottom: 100 }) }, // visible: 100
        { getBoundingClientRect: () => ({ top: 100, bottom: 500 }) },  // visible: 400
        { getBoundingClientRect: () => ({ top: 500, bottom: 600 }) }   // visible: 100
      ];
      const windowHeight = 1000;
      // @ts-ignore - mock objects
      expect(getPrimaryVisibleImageIndex(imgs, windowHeight)).toBe(1);
    });

    it('should prefer the one closer to center if visible heights are equal', () => {
      const windowHeight = 1000;
      const imgs = [
        { getBoundingClientRect: () => ({ top: 0, bottom: 500 }) },   // height 500, center 250, dist 250
        { getBoundingClientRect: () => ({ top: 250, bottom: 750 }) }  // height 500, center 500, dist 0
      ];
      // @ts-ignore
      expect(getPrimaryVisibleImageIndex(imgs, windowHeight)).toBe(1);
    });

    it('should return -1 for empty list', () => {
      expect(getPrimaryVisibleImageIndex([], 1000)).toBe(-1);
    });
  });

  describe('getImageElementByIndex', () => {
    it('should return the element if index is within range', () => {
      const imgs = ['img0', 'img1', 'img2'];
      // @ts-ignore - mock objects
      expect(getImageElementByIndex(imgs, 1)).toBe('img1');
    });

    it('should return null if index is out of range', () => {
      const imgs = ['img0', 'img1'];
      // @ts-ignore - mock objects
      expect(getImageElementByIndex(imgs, 2)).toBe(null);
      // @ts-ignore - mock objects
      expect(getImageElementByIndex(imgs, -1)).toBe(null);
    });
  });

  describe('revertToOriginal', () => {
    /** @type {any} */
    let container;
    /** @type {any} */
    let originalImages;
    /** @type {any} */
    let wrappers;

    beforeEach(() => {
      // Mock DOM elements
      container = {
        style: { cssText: 'some-style' },
        appendChild: vi.fn(),
        querySelectorAll: vi.fn()
      };
      
      originalImages = [
        { style: { cssText: 'img-style' } },
        { style: { cssText: 'img-style-2' } }
      ];

      wrappers = [
        { remove: vi.fn() }
      ];

      container.querySelectorAll.mockReturnValue(wrappers);

      // Mock global document
      vi.stubGlobal('document', {
        querySelector: vi.fn().mockReturnValue(container)
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should reset container styles', () => {
      revertToOriginal(originalImages, container);
      expect(container.style.cssText).toBe('');
    });

    it('should reset image styles and append them to container', () => {
      revertToOriginal(originalImages, container);
      originalImages.forEach((/** @type {any} */ img) => {
        expect(img.style.cssText).toBe('');
        expect(container.appendChild).toHaveBeenCalledWith(img);
      });
    });

    it('should remove wrappers', () => {
      revertToOriginal(originalImages, container);
      expect(container.querySelectorAll).toHaveBeenCalledWith('.comic-row-wrapper');
      wrappers.forEach((/** @type {any} */ w) => {
        expect(w.remove).toHaveBeenCalled();
      });
    });

    it('should do nothing if container is null', () => {
      // @ts-ignore
      revertToOriginal(originalImages, null);
      // No errors should occur
      expect(container.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('fitImagesToViewport', () => {
    /** @type {any} */
    let container;
    /** @type {any} */
    let images;
    /** @type {any[]} */
    let createdElements = [];

    beforeEach(() => {
      createdElements = [];
      images = Array.from({ length: 4 }, (_, i) => ({
        id: `img${i}`,
        naturalWidth: 100,
        naturalHeight: 200,
        style: {},
        remove: vi.fn()
      }));

      container = {
        style: {},
        appendChild: vi.fn(),
        querySelectorAll: vi.fn().mockImplementation((selector) => {
          if (selector === 'img') return images;
          if (selector === '.comic-row-wrapper') return [];
          return [];
        })
      };

      vi.stubGlobal('document', {
        querySelector: vi.fn().mockReturnValue(container),
        createElement: vi.fn().mockImplementation((tag) => {
          const el = { 
            tagName: tag.toUpperCase(), 
            style: {}, 
            appendChild: vi.fn(), 
            className: '' 
          };
          createdElements.push(el);
          return el;
        })
      });
      vi.stubGlobal('window', { innerWidth: 1000, innerHeight: 1000 });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should correctly handle multiple landscape images', () => {
      // 0:P, 1:L, 2:L, 3:P
      images[1].naturalWidth = 500; images[1].naturalHeight = 100;
      images[2].naturalWidth = 500; images[2].naturalHeight = 100;

      fitImagesToViewport(container, 0, true);
      // Expected: 4 solo rows
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
    });

    it('should show first page (index 0) and last page as solo regardless of offset', () => {
      // 4 images (0, 1, 2, 3), all portrait
      // Offset 0: 0(solo), 1(solo), 2(solo), 3(solo)
      // (1 is not a pairing position for offset 0, 2 would be but next is last)
      fitImagesToViewport(container, 0, true);
      
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[0]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[1]);
      expect(wrappers[2].appendChild).toHaveBeenCalledWith(images[2]);
      expect(wrappers[3].appendChild).toHaveBeenCalledWith(images[3]);
    });

    it('should show first page (index 0) and last page as solo with offset 1', () => {
      // 4 images (0, 1, 2, 3), all portrait
      // Offset 1:
      // i=0: [0] solo (first page)
      // i=1: [1-2] pair (effectiveIndex 0, next is 2, not last, so pairing is allowed)
      // i=3: [3] solo (last page)
      fitImagesToViewport(container, 1, true);

      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(3);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[0]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[1]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[2]);
      expect(wrappers[2].appendChild).toHaveBeenCalledWith(images[3]);
    });

    it('should show all pages as solo when there are only 2 pages', () => {
      // 2 images (0, 1), both portrait
      const twoImages = images.slice(0, 2);
      container.querySelectorAll.mockImplementation((/** @type {string} */ selector) => {
        if (selector === 'img') return twoImages;
        if (selector === '.comic-row-wrapper') return [];
        return [];
      });

      fitImagesToViewport(container, 0, true);
      
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(2);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[0]); // First page solo
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[1]); // Last page solo
    });

    it('should pair 1-2 when offset is 1 but 0 and last are solo', () => {
      // 5 images (0, 1, 2, 3, 4), all portrait
      const fiveImages = Array.from({ length: 5 }, (_, i) => ({
        id: `img${i}`, naturalWidth: 100, naturalHeight: 200, style: {}, remove: vi.fn()
      }));
      container.querySelectorAll.mockImplementation((/** @type {string} */ selector) => {
        if (selector === 'img') return fiveImages;
        return [];
      });

      // Offset 1:
      // i=0: [0] solo (first)
      // i=1: [1-2] pair (effectiveIndex 0, next is 2, not last)
      // i=3: [3] solo (next is 4, which is last)
      // i=4: [4] solo (last)
      fitImagesToViewport(container, 1, true);

      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(fiveImages[0]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(fiveImages[1]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(fiveImages[2]);
      expect(wrappers[2].appendChild).toHaveBeenCalledWith(fiveImages[3]);
      expect(wrappers[3].appendChild).toHaveBeenCalledWith(fiveImages[4]);
    });

    it('should maintain global order even when some images are paired and some are solo', () => {
      // Image 1 is landscape
      images[1].naturalWidth = 500;
      images[1].naturalHeight = 100;

      // New Logic with offset 0:
      // i=0: [0] solo (first page)
      // i=1: [1] solo (landscape)
      // i=2: [2] solo (next is last page)
      // i=3: [3] solo (last page)
      
      fitImagesToViewport(container, 0, true);

      // Check the order of appendChild calls on container
      const calls = container.appendChild.mock.calls.map((/** @type {any[]} */ call) => call[0]);
      
      // All calls should be wrappers now
      expect(calls.length).toBe(4);
      expect(calls[0].tagName).toBe('DIV');
      expect(calls[1].tagName).toBe('DIV');
      expect(calls[2].tagName).toBe('DIV');
      expect(calls[3].tagName).toBe('DIV');
    });

    it('should show all pages as solo for 3 images with offset 1', () => {
      // Images: 0:P, 1:P, 2:P (total 3)
      const threeImages = images.slice(0, 3);
      container.querySelectorAll.mockImplementation((/** @type {string} */ selector) => {
        if (selector === 'img') return threeImages;
        return [];
      });

      fitImagesToViewport(container, 1, true);
      // Expected: 0 solo (first), 1 solo (next is last), 2 solo (last) -> 3 rows
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(3);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(threeImages[0]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(threeImages[1]);
      expect(wrappers[2].appendChild).toHaveBeenCalledWith(threeImages[2]);
    });

    it('should call cleanupDOM (remove wrappers)', () => {
      const existingWrapper = { remove: vi.fn() };
      container.querySelectorAll.mockImplementation((/** @type {string} */ selector) => {
        if (selector === '.comic-row-wrapper') return [existingWrapper];
        if (selector === 'img') return images;
        return [];
      });

      fitImagesToViewport(container, 0, true);
      expect(existingWrapper.remove).toHaveBeenCalled();
    });

    it('should do nothing if container is null', () => {
      // @ts-ignore
      fitImagesToViewport(null, 0, true);
      expect(container.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('getNavigationDirection', () => {
    it('should return "next" for positive deltaY above threshold', () => {
      const event = { deltaY: 60 };
      // @ts-ignore
      expect(getNavigationDirection(event, 50)).toBe('next');
    });

    it('should return "prev" for negative deltaY below -threshold', () => {
      const event = { deltaY: -60 };
      // @ts-ignore
      expect(getNavigationDirection(event, 50)).toBe('prev');
    });

    it('should return "none" for deltaY within threshold', () => {
      const event = { deltaY: 30 };
      // @ts-ignore
      expect(getNavigationDirection(event, 50)).toBe('none');
      const event2 = { deltaY: -30 };
      // @ts-ignore
      expect(getNavigationDirection(event2, 50)).toBe('none');
    });

    it('should use default threshold if not provided', () => {
      const event = { deltaY: 55 };
      // @ts-ignore
      expect(getNavigationDirection(event)).toBe('next');
    });
  });

  describe('getClickNavigationDirection', () => {
    /**
     * Helper: create a .comic-row-wrapper div containing the given images.
     * @param {HTMLImageElement[]} imgs
     * @returns {HTMLDivElement}
     */
    function wrapInRow(imgs) {
      const wrapper = document.createElement('div');
      wrapper.className = 'comic-row-wrapper';
      imgs.forEach(img => wrapper.appendChild(img));
      return wrapper;
    }

    it('should return "next" for a single image with no wrapper', () => {
      const img = document.createElement('img');
      // @ts-ignore
      expect(getClickNavigationDirection(img)).toBe('next');
    });

    it('should return "next" for a single image inside a wrapper (見開き1枚だけ)', () => {
      const img = document.createElement('img');
      wrapInRow([img]);
      // @ts-ignore
      expect(getClickNavigationDirection(img)).toBe('next');
    });

    it('should return "prev" for the first child (DOM先頭 = 画面右側) in a spread pair', () => {
      const imgA = document.createElement('img');
      const imgB = document.createElement('img');
      wrapInRow([imgA, imgB]);
      // @ts-ignore
      expect(getClickNavigationDirection(imgA)).toBe('prev');
    });

    it('should return "next" for the second child (DOM末尾 = 画面左側) in a spread pair', () => {
      const imgA = document.createElement('img');
      const imgB = document.createElement('img');
      wrapInRow([imgA, imgB]);
      // @ts-ignore
      expect(getClickNavigationDirection(imgB)).toBe('next');
    });
  });
});

      