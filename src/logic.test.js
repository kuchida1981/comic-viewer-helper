import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateVisibleHeight, shouldPairWithNext, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, fitImagesToViewport, getNavigationDirection, extractMetadata } from './logic';

describe('logic.js', () => {
  describe('extractMetadata', () => {
    beforeEach(() => {
      vi.stubGlobal('document', {
        querySelector: vi.fn(),
        querySelectorAll: vi.fn()
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should extract title from h1', () => {
      // @ts-ignore
      document.querySelector.mockImplementation(sel => {
        if (sel === 'h1') return { textContent: ' My Manga Title ' };
        return null;
      });
      // @ts-ignore
      document.querySelectorAll.mockReturnValue([]);

      const result = extractMetadata();
      expect(result.title).toBe('My Manga Title');
    });

    it('should extract tags from #post-tag a', () => {
      // @ts-ignore
      document.querySelector.mockReturnValue(null);
      // @ts-ignore
      document.querySelectorAll.mockImplementation(sel => {
        if (sel === '#post-tag a') return [
          { textContent: 'Action', href: 'http://tags/action' },
          { textContent: 'Fantasy', href: 'http://tags/fantasy' }
        ];
        return [];
      });

      const result = extractMetadata();
      expect(result.tags).toEqual([
        { text: 'Action', href: 'http://tags/action' },
        { text: 'Fantasy', href: 'http://tags/fantasy' }
      ]);
    });

    it('should extract related works from .post-list-image', () => {
      // @ts-ignore
      document.querySelector.mockReturnValue(null);
      // @ts-ignore
      document.querySelectorAll.mockImplementation(sel => {
        if (sel === '.post-list-image') {
          const mockEl = {
            closest: vi.fn().mockReturnValue({ href: 'http://work/1' }),
            querySelector: vi.fn().mockImplementation(s => {
              if (s === 'img') return { src: 'thumb1.jpg' };
              if (s === 'span') return { textContent: 'Related Work 1' };
              return null;
            })
          };
          return [mockEl];
        }
        return [];
      });

      const result = extractMetadata();
      expect(result.relatedWorks).toEqual([
        { title: 'Related Work 1', href: 'http://work/1', thumb: 'thumb1.jpg' }
      ]);
    });

    it('should extract title from anchor span if not found in .post-list-image span', () => {
      // @ts-ignore
      document.querySelector.mockReturnValue(null);
      // @ts-ignore
      document.querySelectorAll.mockImplementation(sel => {
        if (sel === '.post-list-image') {
          const mockAnchor = { 
            href: 'http://work/2',
            querySelector: vi.fn().mockImplementation(s => {
              if (s === 'span') return { textContent: 'Title from Anchor' };
              return null;
            })
          };
          const mockEl = {
            closest: vi.fn().mockReturnValue(mockAnchor),
            querySelector: vi.fn().mockReturnValue(null) // No span inside .post-list-image
          };
          return [mockEl];
        }
        return [];
      });

      const result = extractMetadata();
      expect(result.relatedWorks[0].title).toBe('Title from Anchor');
    });

    it('should provide default values if elements not found', () => {
      // @ts-ignore
      document.querySelector.mockReturnValue(null);
      // @ts-ignore
      document.querySelectorAll.mockReturnValue([]);

      const result = extractMetadata();
      expect(result).toEqual({
        title: 'Unknown Title',
        tags: [],
        relatedWorks: []
      });
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
      revertToOriginal(originalImages, '#container');
      expect(container.style.cssText).toBe('');
    });

    it('should reset image styles and append them to container', () => {
      revertToOriginal(originalImages, '#container');
      originalImages.forEach((/** @type {any} */ img) => {
        expect(img.style.cssText).toBe('');
        expect(container.appendChild).toHaveBeenCalledWith(img);
      });
    });

    it('should remove wrappers', () => {
      revertToOriginal(originalImages, '#container');
      expect(container.querySelectorAll).toHaveBeenCalledWith('.comic-row-wrapper');
      wrappers.forEach((/** @type {any} */ w) => {
        expect(w.remove).toHaveBeenCalled();
      });
    });

    it('should do nothing if container is not found', () => {
      // @ts-ignore - mockReturnValue is from Vitest
      document.querySelector.mockReturnValue(null);
      revertToOriginal(originalImages, '#container');
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

    it('should pair 0-1 and 2-3 when offset is 0', () => {
      fitImagesToViewport('#container', 0, true);
      
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(2);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[0]);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[1]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[2]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[3]);
    });

    it('should correctly handle multiple landscape images', () => {
      // 0:P, 1:L, 2:L, 3:P
      images[1].naturalWidth = 500; images[1].naturalHeight = 100;
      images[2].naturalWidth = 500; images[2].naturalHeight = 100;

      fitImagesToViewport('#container', 0, true);
      // Expected: 4 solo rows
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
    });

    it('should maintain global order even when some images are paired and some are solo', () => {
      // Image 1 is landscape
      images[1].naturalWidth = 500;
      images[1].naturalHeight = 100;

      // Logic with offset 0:
      // i=0: [0] solo (since next is landscape)
      // i=1: [1] solo (landscape)
      // i=2: [2-3] pair
      
      fitImagesToViewport('#container', 0, true);

      // Check the order of appendChild calls on container
      const calls = container.appendChild.mock.calls.map((/** @type {any[]} */ call) => call[0]);
      
      // All calls should be wrappers now
      expect(calls.length).toBe(3);
      expect(calls[0].tagName).toBe('DIV');
      expect(calls[1].tagName).toBe('DIV');
      expect(calls[2].tagName).toBe('DIV');
    });

    it('should pair correctly with offset 1 and odd number of images', () => {
      // Images: 0:P, 1:P, 2:P (total 3)
      const threeImages = images.slice(0, 3);
      container.querySelectorAll.mockImplementation((/** @type {string} */ selector) => {
        if (selector === 'img') return threeImages;
        return [];
      });

      fitImagesToViewport('#container', 1, true);
      // Expected: 0 solo, 1-2 pair -> 2 rows
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(2);
      // Wrapper 0 is for image 0
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(threeImages[0]);
      // Wrapper 1 is for image 1 and 2
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(threeImages[1]);
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(threeImages[2]);
    });

    it('should call cleanupDOM (remove wrappers)', () => {
      const existingWrapper = { remove: vi.fn() };
      container.querySelectorAll.mockImplementation((/** @type {string} */ selector) => {
        if (selector === '.comic-row-wrapper') return [existingWrapper];
        if (selector === 'img') return images;
        return [];
      });

      fitImagesToViewport('#container', 0, true);
      expect(existingWrapper.remove).toHaveBeenCalled();
    });

    it('should do nothing if container is not found', () => {
      // @ts-ignore - mockReturnValue is from Vitest
      document.querySelector.mockReturnValue(null);
      fitImagesToViewport('#non-existent', 0, true);
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
});

      