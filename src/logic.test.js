import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateVisibleHeight, shouldPairWithNext, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, fitImagesToViewport } from './logic';

describe('logic.js', () => {
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
  });

  describe('getPrimaryVisibleImageIndex', () => {
    it('should return the index of the image with most visible height', () => {
      const imgs = [
        { getBoundingClientRect: () => ({ top: -100, bottom: 100 }) }, // visible: 100
        { getBoundingClientRect: () => ({ top: 100, bottom: 500 }) },  // visible: 400
        { getBoundingClientRect: () => ({ top: 500, bottom: 600 }) }   // visible: 100
      ];
      const windowHeight = 1000;
      expect(getPrimaryVisibleImageIndex(imgs, windowHeight)).toBe(1);
    });

    it('should return -1 for empty list', () => {
      expect(getPrimaryVisibleImageIndex([], 1000)).toBe(-1);
    });
  });

  describe('getImageElementByIndex', () => {
    it('should return the element if index is within range', () => {
      const imgs = ['img0', 'img1', 'img2'];
      expect(getImageElementByIndex(imgs, 1)).toBe('img1');
    });

    it('should return null if index is out of range', () => {
      const imgs = ['img0', 'img1'];
      expect(getImageElementByIndex(imgs, 2)).toBe(null);
      expect(getImageElementByIndex(imgs, -1)).toBe(null);
    });
  });

  describe('revertToOriginal', () => {
    let container;
    let originalImages;
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
      revertToOriginal(originalImages, '#container');
      expect(container.style.cssText).toBe('');
    });

    it('should reset image styles and append them to container', () => {
      revertToOriginal(originalImages, '#container');
      originalImages.forEach(img => {
        expect(img.style.cssText).toBe('');
        expect(container.appendChild).toHaveBeenCalledWith(img);
      });
    });

    it('should remove wrappers', () => {
      revertToOriginal(originalImages, '#container');
      expect(container.querySelectorAll).toHaveBeenCalledWith('.comic-row-wrapper');
      wrappers.forEach(w => {
        expect(w.remove).toHaveBeenCalled();
      });
    });

    it('should do nothing if container is not found', () => {
      document.querySelector.mockReturnValue(null);
      revertToOriginal(originalImages, '#container');
      // No errors should occur
      expect(container.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('fitImagesToViewport', () => {
    let container;
    let images;
    let createdElements = [];

    beforeEach(() => {
      createdElements = [];
      images = Array.from({ length: 4 }, (_, i) => ({
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

    it('should pair 0-1 and 2-3 when offset is 0', () => {
      fitImagesToViewport('#container', 0, true);
      
      // Expect 2 wrapper divs created
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(2);
      
      // First wrapper should contain img 0 and 1
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[0]);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[1]);
      
      // Second wrapper should contain img 2 and 3
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[2]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[3]);
    });

    it('should pair 1-2 when offset is 1 (0 is solo)', () => {
      fitImagesToViewport('#container', 1, true);
      
      // Expect 1 wrapper div created (for 1-2)
      // 0 and 3 are solo
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(1);
      
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[1]);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[2]);
      
      // Solo images are just styled, not appended to wrappers
      expect(images[0].style.display).toBe('block'); // check if styled
    });

    it('should call cleanupDOM (remove wrappers)', () => {
      const existingWrapper = { remove: vi.fn() };
      container.querySelectorAll.mockImplementation((selector) => {
        if (selector === '.comic-row-wrapper') return [existingWrapper];
        if (selector === 'img') return images;
        return [];
      });

      fitImagesToViewport('#container', 0, true);
      expect(existingWrapper.remove).toHaveBeenCalled();
    });
  });
});