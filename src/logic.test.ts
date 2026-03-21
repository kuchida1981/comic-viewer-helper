import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateVisibleHeight,
  shouldPairWithNext,
  getPrimaryVisibleImageIndex,
  getImageElementByIndex,
  revertToOriginal,
  fitImagesToViewport,
  getNavigationDirection,
  waitForImageLoad,
  preloadImages,
  getClickNavigationDirection,
  normalizeUrl,
  pickRandomWork,
  getLuckyCandidatesCount,
  isLuckyPoolDepleted,
  calculateTrends,
  filterWorksByTags,
  encrypt,
  decrypt,
  isEncrypted
  } from './logic';

import { Metadata } from './types.js';
import { createMockImage, setupLocationMock } from './test/mocks/dom.js';

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
        addEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => { listeners[event] = cb as EventListener; }),
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
        addEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => { listeners[event] = cb as EventListener; }),
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
      container = document.createElement('div');
      
      const img1 = document.createElement('img');
      const img2 = document.createElement('img');
      originalImages = [img1, img2];

      const wrapper = document.createElement('div');
      wrapper.className = 'comic-row-wrapper';
      wrapper.appendChild(img1);
      wrapper.appendChild(img2);
      
      container.appendChild(wrapper);
      wrappers = [wrapper];
    });

    it('should reset container styles', () => {
      container.style.cssText = 'some-style';
      revertToOriginal(originalImages, container);
      expect(container.style.cssText).toBe('');
    });

    it('should reset image styles and append them to container', () => {
      originalImages.forEach(img => { img.style.cssText = 'width: 100px;'; });
      
      revertToOriginal(originalImages, container);
      
      originalImages.forEach((img) => {
        expect(img.style.cssText).toBe('');
        expect(img.parentElement).toBe(container);
      });
    });

    it('should remove wrappers', () => {
      revertToOriginal(originalImages, container);
      expect(container.querySelectorAll('.comic-row-wrapper').length).toBe(0);
      expect(wrappers[0].parentElement).toBeNull();
    });

    it('should do nothing if container is null', () => {
      // @ts-expect-error Testing null tolerance
      revertToOriginal(originalImages, null);
      // No errors should occur
    });
  });

  describe('fitImagesToViewport', () => {
    let container: HTMLElement;
    let images: HTMLImageElement[];
    const createdElements: HTMLElement[] = [];

    beforeEach(() => {
      createdElements.length = 0;
      container = document.createElement('div');
      
      images = Array.from({ length: 4 }, (_, i) => {
        const img = document.createElement('img');
        img.id = `img${i}`;
        Object.defineProperty(img, 'naturalWidth', { value: 100, writable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, writable: true });
        container.appendChild(img);
        return img;
      });

      // Spy on createElement to track wrappers
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
        const el = originalCreateElement(tagName, options);
        createdElements.push(el);
        return el;
      });
      
      // Stub window size
      vi.stubGlobal('window', { ...window, innerWidth: 1000, innerHeight: 1000 });
    });

    afterEach(() => {
      vi.restoreAllMocks();
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
      expect(container.children.length).toBe(4);
    });

    it('should show first page (index 0) and last page as solo regardless of offset', () => {
      // 4 images (0, 1, 2, 3), all portrait
      fitImagesToViewport(container, 0, true);
      
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[2].children[0]).toBe(images[2]);
      expect(wrappers[3].children[0]).toBe(images[3]);
    });

    it('should show first page (index 0) and last page as solo with offset 1', () => {
      // 4 images (0, 1, 2, 3), all portrait
      fitImagesToViewport(container, 1, true);

      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(3);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[1].children[1]).toBe(images[2]);
      expect(wrappers[2].children[0]).toBe(images[3]);
    });

    it('should show all pages as solo when there are only 2 pages', () => {
      // 2 images (0, 1), both portrait
      // Remove other images from container
      images[2].remove();
      images[3].remove();
      const twoImages = images.slice(0, 2);
      
      fitImagesToViewport(container, 0, true);
      
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(2);
      expect(wrappers[0].children[0]).toBe(twoImages[0]);
      expect(wrappers[1].children[0]).toBe(twoImages[1]);
    });

    it('should pair 1-2 when offset is 1 but 0 and last are solo', () => {
      // 5 images (0, 1, 2, 3, 4), all portrait
      const img4 = document.createElement('img');
      img4.id = 'img4';
      Object.defineProperty(img4, 'naturalWidth', { value: 100 });
      Object.defineProperty(img4, 'naturalHeight', { value: 200 });
      container.appendChild(img4);
      images.push(img4);

      fitImagesToViewport(container, 1, true);

      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[1].children[1]).toBe(images[2]);
      expect(wrappers[2].children[0]).toBe(images[3]);
      expect(wrappers[3].children[0]).toBe(images[4]);
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

      // Verify DOM order
      expect(container.children.length).toBe(4);
      const wrappers = Array.from(container.children).filter(el => el.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[2].children[0]).toBe(images[2]);
      expect(wrappers[3].children[0]).toBe(images[3]);
    });

    it('should show all pages as solo for 3 images with offset 1', () => {
      // Images: 0:P, 1:P, 2:P (total 3)
      images[3].remove();
      const threeImages = images.slice(0, 3);

      fitImagesToViewport(container, 1, true);
      // Expected: 0 solo (first), 1 solo (next is last), 2 solo (last) -> 3 rows
      const wrappers = Array.from(container.children).filter(el => el.tagName === 'DIV');
      expect(wrappers.length).toBe(3);
      expect(wrappers[0].children[0]).toBe(threeImages[0]);
      expect(wrappers[1].children[0]).toBe(threeImages[1]);
      expect(wrappers[2].children[0]).toBe(threeImages[2]);
    });

    it('should remove unused wrappers', () => {
      // Setup extra wrapper
      const extraWrapper = document.createElement('div');
      extraWrapper.className = 'comic-row-wrapper';
      container.appendChild(extraWrapper);
      
      // Remove all images
      images.forEach(img => img.remove());

      fitImagesToViewport(container, 0, true);
      
      expect(container.querySelector('.comic-row-wrapper')).toBeNull();
      expect(extraWrapper.parentElement).toBeNull();
    });

    it('should do nothing if container is null', () => {
      // @ts-expect-error Testing null tolerance
      fitImagesToViewport(null, 0, true);
      // Should throw no error
    });

    it('should reuse existing wrappers when called with same state (Reconciliation)', () => {
      // First call to set up DOM
      fitImagesToViewport(container, 0, true);
      const firstPassWrappers = Array.from(container.children) as HTMLElement[];
      expect(firstPassWrappers.length).toBeGreaterThan(0);

      // Reset createdElements spy tracking
      createdElements.length = 0;

      // Second call
      fitImagesToViewport(container, 0, true);
      
      const secondPassWrappers = Array.from(container.children) as HTMLElement[];
      
      // Verify same instances are used
      expect(secondPassWrappers.length).toBe(firstPassWrappers.length);
      expect(secondPassWrappers[0]).toBe(firstPassWrappers[0]);
      
      // Verify no NEW wrappers were created via createElement
      expect(createdElements.length).toBe(0);
    });
  });

  describe('normalizeUrl', () => {
    it('should remove query parameters and hashes', () => {
      expect(normalizeUrl('https://example.com/work/123?page=5#top')).toBe('https://example.com/work/123');
    });

    it('should handle relative URLs by resolving against origin', () => {
      setupLocationMock('https://site.com/foo');
      // @ts-expect-error Mocked location might lack origin
      window.location.origin = 'https://site.com';
      expect(normalizeUrl('/work/456')).toBe('https://site.com/work/456');
    });

    it('should return normalized URL even for strings that resolve against base', () => {
      setupLocationMock('http://localhost/');
      // normalizeUrl('not-a-url') will result in 'http://localhost/not-a-url'
      // This is expected behavior for relative-like strings
      expect(normalizeUrl('not-a-url')).toBe('http://localhost/not-a-url');
    });
  });

  describe('getLuckyCandidatesCount', () => {
    const metadata = {
      title: 'T',
      tags: [],
      relatedWorks: [
        { href: 'http://site.com/1', title: '1', thumb: '1.jpg' },
        { href: 'http://site.com/2', title: '2', thumb: '2.jpg' },
        { href: 'http://site.com/3', title: '3', thumb: '3.jpg' }
      ]
    };

    it('should count candidates correctly excluding history and current', () => {
      const history = ['http://site.com/1'];
      const current = 'http://site.com/2';
      // Only http://site.com/3 should remain
      expect(getLuckyCandidatesCount(metadata, history, current)).toBe(1);
    });

    it('should include favorites and search cache in count', () => {
      const searchCache = {
        query: 'q',
        results: {
          results: [{ href: 'http://site.com/4', title: '4', thumb: '4.jpg' }],
          totalCount: '1',
          nextPageUrl: null,
          pagination: []
        },
        fetchedAt: 0
      };
      const favorites = [{ href: 'http://site.com/5', title: '5', thumb: '5.jpg' }];
      
      // related(3) + cache(1) + favorites(1) = 5
      // Current is 'other', history is []
      expect(getLuckyCandidatesCount(metadata, [], 'http://site.com/other', searchCache, favorites)).toBe(5);
    });
  });

  describe('isLuckyPoolDepleted', () => {
    const metadata = {
      title: 'T',
      tags: [],
      relatedWorks: [
        { href: 'http://site.com/1', title: '1', thumb: '1.jpg' },
        { href: 'http://site.com/2', title: '2', thumb: '2.jpg' }
      ]
    };

    it('should return true if count is below threshold', () => {
      expect(isLuckyPoolDepleted(metadata, [], 'http://site.com/other', null, [], 5)).toBe(true);
    });

    it('should return false if count is at or above threshold', () => {
      expect(isLuckyPoolDepleted(metadata, [], 'http://site.com/other', null, [], 2)).toBe(false);
    });
  });

  describe('pickRandomWork', () => {
    const metadata = {
      relatedWorks: [
        { href: 'http://site.com/1', isPrivate: false },
        { href: 'http://site.com/2', isPrivate: false },
        { href: 'http://site.com/3', isPrivate: false }
      ]
    } as unknown as Metadata;

    it('should exclude current URL and history (Strict Mode)', () => {
      const luckyHistory = ['http://site.com/1'];
      const currentUrl = 'http://site.com/2';
      
      // Should only pick /3
      const result = pickRandomWork(metadata, luckyHistory, currentUrl);
      expect(result).toBe('http://site.com/3');
    });

    it('should fallback to Relaxed Mode if strict mode yields no candidates', () => {
      // History has 1, 2, 3. Current is 2.
      // Pool is [1, 2, 3].
      // Strict Mode (All History + Current) -> []
      // Relaxed Mode (Last 3 + Current) -> Pool - {Last 3 + Current}
      // Wait, let's re-verify the pool and history.
      const luckyHistory = ['http://site.com/4', 'http://site.com/3', 'http://site.com/2', 'http://site.com/1'];
      const currentUrl = 'http://site.com/3';
      
      // Pool: [1, 2, 3]
      // Strict: Exclude [4, 3, 2, 1] + 3 -> Empty
      // Relaxed: Exclude [4, 3, 2] (last 3) + 3 -> Pool has [1] left
      const result = pickRandomWork(metadata, luckyHistory, currentUrl);
      expect(result).toBe('http://site.com/1');
    });

    it('should fallback to Minimal Mode if relaxed mode also yields no candidates', () => {
      const luckyHistory = ['http://site.com/3', 'http://site.com/2', 'http://site.com/1'];
      const currentUrl = 'http://site.com/2';
      
      // Pool: [1, 2, 3]
      // Strict/Relaxed: Exclude [3, 2, 1] + 2 -> Empty
      // Minimal: Exclude [2] (current only) -> Pool has [1, 3] left
      const result = pickRandomWork(metadata, luckyHistory, currentUrl);
      expect(['http://site.com/1', 'http://site.com/3']).toContain(result);
    });

    it('should return null if discovery pool is empty', () => {
      const emptyMetadata = { relatedWorks: [] } as unknown as Metadata;
      expect(pickRandomWork(emptyMetadata, [], 'http://any.com')).toBe(null);
    });

    it('should use 2-step selection within filtered candidates', () => {
      const favorites = [{ href: 'http://site.com/fave', title: 'Fave', thumb: '' }];
      const metaWithFave = {
        relatedWorks: [
          { href: 'http://site.com/1', isPrivate: false },
          { href: 'http://site.com/fave', isPrivate: false }
        ]
      } as unknown as Metadata;

      vi.spyOn(Math, 'random').mockReturnValue(0.1); // Favorite slot
      const result = pickRandomWork(metaWithFave, [], 'http://site.com/other', null, favorites);
      expect(result).toBe('http://site.com/fave');
      vi.restoreAllMocks();
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
});

describe('calculateTrends', () => {
  const taggedFavorites = [
    {
      title: 'Work A', href: '/work/1/', thumb: '',
      tags: [
        { text: 'fantasy', href: '/tags/fantasy', type: 'genre' as const },
        { text: 'alice', href: '/artists/alice', type: 'artist' as const }
      ]
    },
    {
      title: 'Work B', href: '/work/2/', thumb: '',
      tags: [
        { text: 'fantasy', href: '/tags/fantasy', type: 'genre' as const },
        { text: 'bob', href: '/artists/bob', type: 'artist' as const }
      ]
    },
    {
      title: 'Work C', href: '/work/3/', thumb: ''
    }
  ];

  it('should count tag occurrences across favorites', () => {
    const trends = calculateTrends(taggedFavorites);
    const fantasy = trends.find(t => t.tag.text === 'fantasy');
    expect(fantasy?.count).toBe(2);
  });

  it('should sort by count descending', () => {
    const trends = calculateTrends(taggedFavorites);
    expect(trends[0].tag.text).toBe('fantasy');
  });

  it('should return at most 10 items', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    const trends = calculateTrends([manyTagFavorite]);
    expect(trends.length).toBeLessThanOrEqual(10);
  });

  it('should return empty array when favorites have no tags', () => {
    const trends = calculateTrends([{ title: 'Work', href: '/work/1/', thumb: '' }]);
    expect(trends).toHaveLength(0);
  });

  it('should handle empty favorites array', () => {
    expect(calculateTrends([])).toHaveLength(0);
  });

  it('should return all tags when limit is 0', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    const trends = calculateTrends([manyTagFavorite], 0);
    expect(trends.length).toBe(15);
  });

  it('should return at most N tags when custom limit is specified', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    const trends = calculateTrends([manyTagFavorite], 5);
    expect(trends.length).toBe(5);
  });

  it('should default to top 10 when no limit specified', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    const trends = calculateTrends([manyTagFavorite]);
    expect(trends.length).toBe(10);
  });

  it('should include isPinned=false for all items when no pinnedTags', () => {
    const trends = calculateTrends(taggedFavorites);
    expect(trends.every(t => !t.isPinned)).toBe(true);
  });

  it('should mark pinned tags with isPinned=true', () => {
    const trends = calculateTrends(taggedFavorites, 10, ['alice']);
    const alice = trends.find(t => t.tag.text === 'alice');
    expect(alice?.isPinned).toBe(true);
    const fantasy = trends.find(t => t.tag.text === 'fantasy');
    expect(fantasy?.isPinned).toBeFalsy();
  });

  it('should sort pinned tags before unpinned tags regardless of count', () => {
    const trends = calculateTrends(taggedFavorites, 10, ['alice']);
    expect(trends[0].tag.text).toBe('alice');
    expect(trends[0].isPinned).toBe(true);
  });

  it('should sort multiple pinned tags by count within the pinned group', () => {
    const favorites = [
      {
        title: 'Work A', href: '/work/1/', thumb: '',
        tags: [
          { text: 'alice', href: '/artists/alice', type: 'artist' as const },
          { text: 'bob', href: '/artists/bob', type: 'artist' as const }
        ]
      },
      {
        title: 'Work B', href: '/work/2/', thumb: '',
        tags: [
          { text: 'alice', href: '/artists/alice', type: 'artist' as const }
        ]
      }
    ];
    const trends = calculateTrends(favorites, 10, ['alice', 'bob']);
    expect(trends[0].tag.text).toBe('alice');
    expect(trends[0].count).toBe(2);
    expect(trends[1].tag.text).toBe('bob');
    expect(trends[1].count).toBe(1);
    expect(trends[0].isPinned).toBe(true);
    expect(trends[1].isPinned).toBe(true);
  });

  it('should not add pinned tags that do not appear in favorites', () => {
    const trends = calculateTrends(taggedFavorites, 10, ['nonexistent']);
    expect(trends.find(t => t.tag.text === 'nonexistent')).toBeUndefined();
  });

  it('should sort selected tags before pinned tags and count', () => {
    // taggedFavorites: fantasy(count=2), alice(count=1), bob(count=1)
    // alice is pinned, bob is selected
    const trends = calculateTrends(taggedFavorites, 10, ['alice'], ['bob']);
    expect(trends[0].tag.text).toBe('bob');
    expect(trends[1].tag.text).toBe('alice');
    expect(trends[2].tag.text).toBe('fantasy');
  });

  it('should sort multiple selected tags before pinned tags', () => {
    const trends = calculateTrends(taggedFavorites, 10, [], ['alice', 'bob']);
    const selectedTexts = trends.slice(0, 2).map(t => t.tag.text);
    expect(selectedTexts).toContain('alice');
    expect(selectedTexts).toContain('bob');
    expect(trends[2].tag.text).toBe('fantasy');
  });

  it('should expand limit to show all selected tags beyond normal limit', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    // Select 12 tags but limit is 10
    const selectedTags = Array.from({ length: 12 }, (_, i) => `tag${i}`);
    const trends = calculateTrends([manyTagFavorite], 10, [], selectedTags);
    expect(trends.length).toBe(12);
    // All selected tags should be at the front
    for (let i = 0; i < 12; i++) {
      expect(selectedTags).toContain(trends[i].tag.text);
    }
  });

  it('should not expand limit when selected count is less than limit', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    const trends = calculateTrends([manyTagFavorite], 10, [], ['tag0', 'tag1']);
    expect(trends.length).toBe(10);
  });

  it('should return all tags when limit is 0 regardless of selectedTags', () => {
    const manyTagFavorite = {
      title: 'Work', href: '/work/1/', thumb: '',
      tags: Array.from({ length: 15 }, (_, i) => ({ text: `tag${i}`, href: `/tags/tag${i}`, type: null }))
    };
    const trends = calculateTrends([manyTagFavorite], 0, [], ['tag0']);
    expect(trends.length).toBe(15);
  });
});

describe('filterWorksByTags', () => {
  const works = [
    {
      title: 'Work A', href: '/work/1/', thumb: '',
      tags: [
        { text: 'fantasy', href: '/tags/fantasy', type: 'genre' as const },
        { text: 'alice', href: '/artists/alice', type: 'artist' as const }
      ]
    },
    {
      title: 'Work B', href: '/work/2/', thumb: '',
      tags: [
        { text: 'fantasy', href: '/tags/fantasy', type: 'genre' as const },
        { text: 'bob', href: '/artists/bob', type: 'artist' as const }
      ]
    },
    {
      title: 'Work C', href: '/work/3/', thumb: ''
    }
  ];

  it('should return all works when selectedTagTexts is empty', () => {
    const result = filterWorksByTags(works, new Set());
    expect(result).toHaveLength(3);
  });

  it('should filter by a single tag', () => {
    const result = filterWorksByTags(works, new Set(['fantasy']));
    expect(result).toHaveLength(2);
    expect(result.every(w => w.tags?.some(t => t.text === 'fantasy'))).toBe(true);
  });

  it('should apply AND logic for multiple tags', () => {
    const result = filterWorksByTags(works, new Set(['fantasy', 'alice']));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Work A');
  });

  it('should return empty array when no works match all selected tags', () => {
    const result = filterWorksByTags(works, new Set(['alice', 'bob']));
    expect(result).toHaveLength(0);
  });

  it('should handle works with no tags gracefully', () => {
    const result = filterWorksByTags(works, new Set(['fantasy']));
    expect(result.map(w => w.title)).not.toContain('Work C');
  });

  it('should return empty array for empty works list', () => {
    const result = filterWorksByTags([], new Set(['fantasy']));
    expect(result).toHaveLength(0);
  });
});

describe('encrypt / decrypt / isEncrypted', () => {
  it('isEncrypted returns false for plain JSON', () => {
    expect(isEncrypted('{"version":1}')).toBe(false);
  });

  it('isEncrypted returns true for AES-GCM encrypted blob', async () => {
    const blob = await encrypt('hello', 'password');
    expect(isEncrypted(blob)).toBe(true);
  });

  it('encrypt produces AES-GCM:v1: prefixed string', async () => {
    const result = await encrypt('test data', 'mypassword');
    expect(result.startsWith('AES-GCM:v1:')).toBe(true);
    const parts = result.slice('AES-GCM:v1:'.length).split(':');
    expect(parts).toHaveLength(3);
  });

  it('decrypt correctly decrypts what encrypt produced', async () => {
    const plaintext = 'Hello, World!';
    const password = 'secret123';
    const encrypted = await encrypt(plaintext, password);
    const decrypted = await decrypt(encrypted, password);
    expect(decrypted).toBe(plaintext);
  });

  it('decrypt throws on wrong password', async () => {
    const encrypted = await encrypt('sensitive data', 'correctPassword');
    await expect(decrypt(encrypted, 'wrongPassword')).rejects.toThrow();
  });

  it('decrypt throws on invalid format (no prefix)', async () => {
    await expect(decrypt('{"version":1}', 'password')).rejects.toThrow('Invalid encrypted data format');
  });

  it('decrypt throws on invalid format (bad structure)', async () => {
    await expect(decrypt('AES-GCM:v1:only-two-parts', 'password')).rejects.toThrow('Invalid encrypted data format');
  });

  it('each encrypt call produces a different ciphertext (random IV/salt)', async () => {
    const plaintext = 'same message';
    const password = 'same password';
    const enc1 = await encrypt(plaintext, password);
    const enc2 = await encrypt(plaintext, password);
    expect(enc1).not.toBe(enc2);
  });
});