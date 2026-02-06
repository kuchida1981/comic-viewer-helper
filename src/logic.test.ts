import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateVisibleHeight, shouldPairWithNext, getPrimaryVisibleImageIndex, getImageElementByIndex, revertToOriginal, fitImagesToViewport, getNavigationDirection, waitForImageLoad, preloadImages, getClickNavigationDirection, jumpToRandomWork } from './logic.js';
import { Metadata, SearchCache } from './types.js';
import { createMockImage, asNodeList, setupLocationMock } from './test/mocks/dom.js';

describe('logic.js', () => {
  describe('waitForImageLoad', () => {
    it('should resolve immediately if image is already complete and has height', async () => {
      const img = createMockImage({ complete: true, naturalHeight: 100 });
      await expect(waitForImageLoad(img)).resolves.toBeUndefined();
    });

    it('should resolve when load event fires', async () => {
      const listeners: Record<string, EventListener> = {};
      const img = createMockImage({
        complete: false,
        addEventListener: vi.fn((event, cb) => { listeners[event] = cb as EventListener; }),
        removeEventListener: vi.fn()
      });

      const promise = waitForImageLoad(img);
      listeners['load']({} as Event);
      await expect(promise).resolves.toBeUndefined();
      expect(img.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
    });

    it('should resolve when error event fires', async () => {
      const listeners: Record<string, EventListener> = {};
      const img = createMockImage({
        complete: false,
        addEventListener: vi.fn((event, cb) => { listeners[event] = cb as EventListener; }),
        removeEventListener: vi.fn()
      });

      const promise = waitForImageLoad(img);
      listeners['error']({} as Event);
      await expect(promise).resolves.toBeUndefined();
    });

    it('should resolve on timeout', async () => {
      vi.useFakeTimers();
      const img = createMockImage({
        complete: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      });

      const promise = waitForImageLoad(img, 1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe('preloadImages', () => {
    it('should trigger decode for next images', () => {
      const images = Array.from({ length: 5 }, () => createMockImage({
        complete: false,
        loading: 'lazy',
        decode: vi.fn().mockResolvedValue(undefined)
      }));
      
      preloadImages(images, 0, 2);
      
      expect(images[1].loading).toBe('eager');
      expect(images[1].decode).toHaveBeenCalled();
      expect(images[2].loading).toBe('eager');
      expect(images[2].decode).toHaveBeenCalled();
      expect(images[3].loading).toBe('lazy'); // Out of range
    });

    it('should handle images without decode method', () => {
      const images = Array.from({ length: 3 }, () => createMockImage({
        complete: false,
        loading: 'lazy'
      }));
      
      preloadImages(images, 0, 1);
      
      expect(images[1].loading).toBe('eager');
    });

    it('should skip already complete images', () => {
      const decode0 = vi.fn();
      const decode1 = vi.fn();
      const images = [
        createMockImage({ complete: true, loading: 'lazy', decode: decode0 }),
        createMockImage({ complete: true, loading: 'lazy', decode: decode1 })
      ];

      preloadImages(images, 0, 1);

      expect(images[1].loading).toBe('lazy');
      expect(decode1).not.toHaveBeenCalled();
    });

    it('should preload previous images', () => {
      const images = Array.from({ length: 5 }, () => createMockImage({
        complete: false,
        loading: 'lazy',
        decode: vi.fn().mockResolvedValue(undefined)
      }));
      
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
        createMockImage({ getBoundingClientRect: () => ({ top: -100, bottom: 100 }) }), // visible: 100
        createMockImage({ getBoundingClientRect: () => ({ top: 100, bottom: 500 }) }),  // visible: 400
        createMockImage({ getBoundingClientRect: () => ({ top: 500, bottom: 600 }) })   // visible: 100
      ];
      const windowHeight = 1000;
      expect(getPrimaryVisibleImageIndex(imgs, windowHeight)).toBe(1);
    });

    it('should prefer the one closer to center if visible heights are equal', () => {
      const windowHeight = 1000;
      const imgs = [
        createMockImage({ getBoundingClientRect: () => ({ top: 0, bottom: 500 }) }),   // height 500, center 250, dist 250
        createMockImage({ getBoundingClientRect: () => ({ top: 250, bottom: 750 }) })  // height 500, center 500, dist 0
      ];
      expect(getPrimaryVisibleImageIndex(imgs, windowHeight)).toBe(1);
    });

    it('should return -1 for empty list', () => {
      expect(getPrimaryVisibleImageIndex([], 1000)).toBe(-1);
    });
  });

  describe('getImageElementByIndex', () => {
    it('should return the element if index is within range', () => {
      const imgs = [createMockImage({ id: 'img0' }), createMockImage({ id: 'img1' }), createMockImage({ id: 'img2' })];
      expect(getImageElementByIndex(imgs, 1)).toBe(imgs[1]);
    });

    it('should return null if index is out of range', () => {
      const imgs = [createMockImage({ id: 'img0' }), createMockImage({ id: 'img1' })];
      expect(getImageElementByIndex(imgs, 2)).toBe(null);
      expect(getImageElementByIndex(imgs, -1)).toBe(null);
    });
  });

  describe('revertToOriginal', () => {
    let container: HTMLElement;
    let originalImages: HTMLImageElement[];
    let wrappers: HTMLElement[];

    beforeEach(() => {
      // Mock DOM elements
      container = {
        style: { cssText: 'some-style' },
        appendChild: vi.fn(),
        querySelectorAll: vi.fn()
      } as unknown as HTMLElement;
      
      originalImages = [
        createMockImage({ style: { cssText: 'img-style' } }),
        createMockImage({ style: { cssText: 'img-style-2' } })
      ];

      wrappers = [
        { remove: vi.fn() }
      ] as unknown as HTMLElement[];

      vi.mocked(container.querySelectorAll).mockReturnValue(asNodeList(wrappers));

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
      originalImages.forEach((img) => {
        expect(img.style.cssText).toBe('');
        expect(container.appendChild).toHaveBeenCalledWith(img);
      });
    });

    it('should remove wrappers', () => {
      revertToOriginal(originalImages, container);
      expect(container.querySelectorAll).toHaveBeenCalledWith('.comic-row-wrapper');
      wrappers.forEach((w) => {
        expect(w.remove).toHaveBeenCalled();
      });
    });

    it('should do nothing if container is null', () => {
      revertToOriginal(originalImages, null as unknown as HTMLElement);
      // No errors should occur
      expect(container.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('fitImagesToViewport', () => {
    let container: HTMLElement;
    let images: HTMLImageElement[];
    let createdElements: HTMLElement[] = [];

    beforeEach(() => {
      createdElements = [];
      images = Array.from({ length: 4 }, (_, i) => createMockImage({
        id: `img${i}`,
        naturalWidth: 100,
        naturalHeight: 200,
        style: {},
        remove: vi.fn()
      }));

      container = {
        style: {},
        appendChild: vi.fn(),
        querySelectorAll: vi.fn((selector: string) => {
          if (selector === 'img') return asNodeList(images);
          if (selector === '.comic-row-wrapper') return asNodeList([]);
          return asNodeList([]);
        })
      } as unknown as HTMLElement;

      vi.stubGlobal('document', {
        querySelector: vi.fn().mockReturnValue(container),
        createElement: vi.fn().mockImplementation((tag) => {
          const el = { 
            tagName: tag.toUpperCase(), 
            style: {}, 
            appendChild: vi.fn(), 
            className: '' 
          };
          createdElements.push(el as unknown as HTMLElement);
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
      Object.defineProperty(images[1], 'naturalWidth', { value: 500 });
      Object.defineProperty(images[1], 'naturalHeight', { value: 100 });
      Object.defineProperty(images[2], 'naturalWidth', { value: 500 });
      Object.defineProperty(images[2], 'naturalHeight', { value: 100 });

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
      vi.mocked(container.querySelectorAll).mockImplementation((selector: string) => {
        if (selector === 'img') return asNodeList(twoImages);
        if (selector === '.comic-row-wrapper') return asNodeList([]);
        return asNodeList([]);
      });

      fitImagesToViewport(container, 0, true);
      
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(2);
      expect(wrappers[0].appendChild).toHaveBeenCalledWith(images[0]); // First page solo
      expect(wrappers[1].appendChild).toHaveBeenCalledWith(images[1]); // Last page solo
    });

    it('should pair 1-2 when offset is 1 but 0 and last are solo', () => {
      // 5 images (0, 1, 2, 3, 4), all portrait
      const fiveImages = Array.from({ length: 5 }, (_, i) => createMockImage({
        id: `img${i}`, naturalWidth: 100, naturalHeight: 200, style: {}, remove: vi.fn()
      }));
      vi.mocked(container.querySelectorAll).mockImplementation((selector: string) => {
        if (selector === 'img') return asNodeList(fiveImages);
        return asNodeList([]);
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
      Object.defineProperty(images[1], 'naturalWidth', { value: 500 });
      Object.defineProperty(images[1], 'naturalHeight', { value: 100 });

      // New Logic with offset 0:
      // i=0: [0] solo (first page)
      // i=1: [1] solo (landscape)
      // i=2: [2] solo (next is last page)
      // i=3: [3] solo (last page)
      
      fitImagesToViewport(container, 0, true);

      // Check the order of appendChild calls on container
      const calls = vi.mocked(container.appendChild).mock.calls.map(call => call[0] as HTMLElement);
      
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
      vi.mocked(container.querySelectorAll).mockImplementation((selector: string) => {
        if (selector === 'img') return asNodeList(threeImages);
        return asNodeList([]);
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
      vi.mocked(container.querySelectorAll).mockImplementation((selector: string) => {
        if (selector === '.comic-row-wrapper') return asNodeList([existingWrapper] as unknown as HTMLElement[]);
        if (selector === 'img') return asNodeList(images);
        return asNodeList([]);
      });

      fitImagesToViewport(container, 0, true);
      expect(existingWrapper.remove).toHaveBeenCalled();
    });

    it('should do nothing if container is null', () => {
      fitImagesToViewport(null as unknown as HTMLElement, 0, true);
      expect(container.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('getNavigationDirection', () => {
    it('should return "next" for positive deltaY above threshold', () => {
      const event = { deltaY: 60 } as WheelEvent;
      expect(getNavigationDirection(event, 50)).toBe('next');
    });

    it('should return "prev" for negative deltaY below -threshold', () => {
      const event = { deltaY: -60 } as WheelEvent;
      expect(getNavigationDirection(event, 50)).toBe('prev');
    });

    it('should return "none" for deltaY within threshold', () => {
      const event = { deltaY: 30 } as WheelEvent;
      expect(getNavigationDirection(event, 50)).toBe('none');
      const event2 = { deltaY: -30 } as WheelEvent;
      expect(getNavigationDirection(event2, 50)).toBe('none');
    });

    it('should use default threshold if not provided', () => {
      const event = { deltaY: 55 } as WheelEvent;
      expect(getNavigationDirection(event)).toBe('next');
    });
  });

  describe('getClickNavigationDirection', () => {
    /**
     * Helper: create a .comic-row-wrapper div containing the given images.
     */
    function wrapInRow(imgs: HTMLImageElement[]) {
      const wrapper = document.createElement('div');
      wrapper.className = 'comic-row-wrapper';
      imgs.forEach(img => wrapper.appendChild(img));
      return wrapper;
    }

    it('should return "next" for a single image with no wrapper', () => {
      const img = document.createElement('img');
      expect(getClickNavigationDirection(img)).toBe('next');
    });

    it('should return "next" for a single image inside a wrapper (見開き1枚だけ)', () => {
      const img = document.createElement('img');
      wrapInRow([img]);
      expect(getClickNavigationDirection(img)).toBe('next');
    });

    it('should return "prev" for the first child (DOM先頭 = 画面右側) in a spread pair', () => {
      const imgA = document.createElement('img');
      const imgB = document.createElement('img');
      wrapInRow([imgA, imgB]);
      expect(getClickNavigationDirection(imgA)).toBe('prev');
    });

    it('should return "next" for the second child (DOM末尾 = 画面左側) in a spread pair', () => {
      const imgA = document.createElement('img');
      const imgB = document.createElement('img');
      wrapInRow([imgA, imgB]);
      expect(getClickNavigationDirection(imgB)).toBe('next');
    });
  });

  describe('jumpToRandomWork', () => {
    beforeEach(() => {
      setupLocationMock('current-page');
    });

    afterEach(() => {
      vi.spyOn(Math, 'random').mockRestore();
    });

    it('should update window.location.href with a random non-private work from relatedWorks', () => {
      const metadata = {
        relatedWorks: [
          { href: 'http://example.com/1', isPrivate: false },
          { href: 'http://example.com/2', isPrivate: true },
          { href: 'http://example.com/3', isPrivate: false }
        ]
      } as unknown as Metadata;

      vi.spyOn(Math, 'random').mockReturnValue(0.99); // Selects index 1 of [1, 3]

      jumpToRandomWork(metadata);

      expect(window.location.href).toBe('http://example.com/3');
    });

    it('should include works from searchCache', () => {
      const metadata = { relatedWorks: [] } as unknown as Metadata;
      const searchCache = {
        results: {
          results: [
            { href: 'http://example.com/search1' },
            { href: 'http://example.com/search2' }
          ]
        }
      } as unknown as SearchCache;

      vi.spyOn(Math, 'random').mockReturnValue(0); // Selects first

      jumpToRandomWork(metadata, searchCache);

      expect(window.location.href).toBe('http://example.com/search1');
    });

    it('should deduplicate works by href when merging both sources', () => {
      const metadata = {
        relatedWorks: [{ href: 'http://example.com/common', isPrivate: false }]
      } as unknown as Metadata;
      const searchCache = {
        results: {
          results: [{ href: 'http://example.com/common' }]
        }
      } as unknown as SearchCache;

      // If deduplication works, there's only 1 item in the pool
      jumpToRandomWork(metadata, searchCache);

      expect(window.location.href).toBe('http://example.com/common');
    });

    it('should filter private works from relatedWorks but not affecting search results', () => {
      const metadata = {
        relatedWorks: [{ href: 'http://example.com/private', isPrivate: true }]
      } as unknown as Metadata;
      const searchCache = {
        results: {
          results: [{ href: 'http://example.com/search' }]
        }
      } as unknown as SearchCache;

      jumpToRandomWork(metadata, searchCache);

      // Should skip private and pick the only search result
      expect(window.location.href).toBe('http://example.com/search');
    });

    it('should do nothing if no works are available after filtering and merging', () => {
      const metadata = { relatedWorks: [{ isPrivate: true }] } as unknown as Metadata;
      const searchCache = { results: { results: [] } } as unknown as SearchCache;

      jumpToRandomWork(metadata, searchCache);
      expect(window.location.href).toBe('current-page');
    });

    it('should handle null searchCache gracefully', () => {
      const metadata = {
        relatedWorks: [{ href: 'http://example.com/1', isPrivate: false }]
      } as unknown as Metadata;

      jumpToRandomWork(metadata, null);
      expect(window.location.href).toBe('http://example.com/1');
    });
  });
});