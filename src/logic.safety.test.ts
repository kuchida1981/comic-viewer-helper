import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getPrimaryVisibleImageIndex,
  fitImagesToViewport,
  revertToOriginal,
  cleanupDOM,
  waitForImageLoad,
  preloadImages,
  forceImageLoad,
  normalizeUrl,
  getLuckyCandidatesCount
} from './logic.js';
import { Metadata, SearchCache } from './types.js';
import { createMockImage, asNodeList } from './test/mocks/dom.js';

describe('logic.ts - Safety & Robustness', () => {

  describe('getPrimaryVisibleImageIndex (Safety)', () => {
    it('should return -1 if image list is empty or null', () => {
      expect(getPrimaryVisibleImageIndex([], 1000)).toBe(-1);
      // @ts-expect-error Testing runtime safety for null
      expect(getPrimaryVisibleImageIndex(null, 1000)).toBe(-1);
      // @ts-expect-error Testing runtime safety for undefined
      expect(getPrimaryVisibleImageIndex(undefined, 1000)).toBe(-1);
    });

    it('should handle elements missing getBoundingClientRect', () => {
      const windowHeight = 1000;
      const validImg = createMockImage({
        getBoundingClientRect: () => ({ top: 0, bottom: 500 }) // Visible
      });
      // Invalid object (no getBoundingClientRect)
      const invalidImg = {} as unknown as HTMLImageElement;
      // Null element
      const nullImg = null as unknown as HTMLImageElement;

      const imgs = [nullImg, invalidImg, validImg];

      // Should skip invalid ones and find the valid one (index 2)
      const result = getPrimaryVisibleImageIndex(imgs, windowHeight);
      expect(result).toBe(2);
    });

    it('should return -1 when all images are below the viewport (visibleHeight = 0)', () => {
      // Covers the ELSE branch of `if (visibleHeight > 0)` in getPrimaryVisibleImageIndex
      const windowHeight = 1000;
      const belowViewportImg = createMockImage({
        getBoundingClientRect: () => ({ top: 2000, bottom: 2100 }) // Below viewport
      });
      expect(getPrimaryVisibleImageIndex([belowViewportImg], windowHeight)).toBe(-1);
    });
  });

  describe('fitImagesToViewport (Safety)', () => {
    it('should safely skip invalid image elements', () => {
      const container = document.createElement('div');

      const validImg = document.createElement('img');
      Object.defineProperty(validImg, 'naturalWidth', { value: 100, configurable: true });
      Object.defineProperty(validImg, 'naturalHeight', { value: 100, configurable: true });

      const invalidImg = document.createElement('img');
      Object.defineProperty(invalidImg, 'naturalWidth', { value: undefined, configurable: true });

      const imgs = [validImg, invalidImg];

      // Mock querySelectorAll to return our mixed list
      container.querySelectorAll = vi.fn().mockImplementation((selector) => {
        if (selector === 'img') return asNodeList(imgs);
        if (selector === '.comic-row-wrapper') return asNodeList([]);
        return asNodeList([]);
      });

      // Mock window dimensions
      vi.stubGlobal('innerWidth', 1024);
      vi.stubGlobal('innerHeight', 768);

      // Should not throw
      expect(() => fitImagesToViewport(container)).not.toThrow();

      // Verify validImg was processed (style modified)
      expect(validImg.style.maxWidth).not.toBe('');

      // Verify invalidImg was skipped
      // cleanupDOM sets cssText = ''
      // fitImagesToViewport sets maxWidth
      expect(invalidImg.style.maxWidth).toBe('');
    });

    it('should skip pairing when both images are landscape in dual-view mode', () => {
      const container = document.createElement('div');

      // 5 landscape images: i=2 is eligible for pairing but shouldPairWithNext returns false
      // because current image is landscape → line 285 (getPairingInfo fallback) is reached
      const landscapeImgs = Array.from({ length: 5 }, () => {
        const img = document.createElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 100, configurable: true });
        return img;
      });

      container.querySelectorAll = vi.fn().mockImplementation((selector: string) => {
        if (selector === 'img') return asNodeList(landscapeImgs);
        if (selector === '.comic-row-wrapper') return asNodeList([]);
        return asNodeList([]);
      });

      vi.stubGlobal('innerWidth', 1024);
      vi.stubGlobal('innerHeight', 768);

      // With isDualViewEnabled=true and all landscape, pairing is rejected → all solo rows
      expect(() => fitImagesToViewport(container, 0, true)).not.toThrow();
      expect(container.children.length).toBe(5);
    });

    it('should skip pairing when next image is landscape (portrait + landscape pair)', () => {
      // Covers `if (next.isLandscape) return false;` in shouldPairWithNext
      // i=2 is eligible: current=portrait, next=landscape → shouldPairWithNext returns false at next.isLandscape check
      const container = document.createElement('div');

      const makePortrait = () => {
        const img = document.createElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true });
        return img;
      };
      const makeLandscape = () => {
        const img = document.createElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 200, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 100, configurable: true });
        return img;
      };

      // 5 images: 0:P, 1:P, 2:P, 3:L, 4:P → at i=2 (eligible), current portrait + next landscape
      const imgs = [makePortrait(), makePortrait(), makePortrait(), makeLandscape(), makePortrait()];

      container.querySelectorAll = vi.fn().mockImplementation((selector: string) => {
        if (selector === 'img') return asNodeList(imgs);
        if (selector === '.comic-row-wrapper') return asNodeList([]);
        return asNodeList([]);
      });

      vi.stubGlobal('innerWidth', 1024);
      vi.stubGlobal('innerHeight', 768);

      expect(() => fitImagesToViewport(container, 0, true)).not.toThrow();
    });

    it('should skip pairing when candidate has undefined naturalWidth', () => {
      // Covers the ELSE branch of `if (img && candidate && typeof img.naturalWidth === 'number' && ...)`
      // in getPairingInfo (when candidate's naturalWidth is not a number)
      const container = document.createElement('div');

      const makePortrait = () => {
        const img = document.createElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true });
        return img;
      };
      const makeUndefinedWidth = () => {
        const img = document.createElement('img');
        Object.defineProperty(img, 'naturalWidth', { value: undefined, configurable: true });
        return img;
      };

      // 5 images: 0:P, 1:P, 2:P, 3:undefined, 4:P
      // At i=2 (eligible): candidate=imgs[3] with undefined naturalWidth → condition FALSE → line 285
      const imgs = [makePortrait(), makePortrait(), makePortrait(), makeUndefinedWidth(), makePortrait()];

      container.querySelectorAll = vi.fn().mockImplementation((selector: string) => {
        if (selector === 'img') return asNodeList(imgs);
        if (selector === '.comic-row-wrapper') return asNodeList([]);
        return asNodeList([]);
      });

      vi.stubGlobal('innerWidth', 1024);
      vi.stubGlobal('innerHeight', 768);

      expect(() => fitImagesToViewport(container, 0, true)).not.toThrow();
    });

    it('should not call replaceChildren when paired wrapper already has correct children', () => {
      // Covers the FALSE branch of `if (wrapper.children[0] !== img || ...)` in applyRowLayout
      // This is the reconciliation case for paired (dual-view) images
      const container = document.createElement('div');

      // 4 portrait images in real DOM
      const imgs = Array.from({ length: 4 }, (_, i) => {
        const img = document.createElement('img');
        img.id = `img${i}`;
        Object.defineProperty(img, 'naturalWidth', { value: 100, configurable: true });
        Object.defineProperty(img, 'naturalHeight', { value: 200, configurable: true });
        container.appendChild(img);
        return img;
      });

      vi.stubGlobal('innerWidth', 1024);
      vi.stubGlobal('innerHeight', 768);
      vi.stubGlobal('window', { ...window, innerWidth: 1024, innerHeight: 768 });

      // First call: with offset=1, imgs[1]+imgs[2] are paired
      fitImagesToViewport(container, 1, true);
      const firstChildCount = container.children.length;

      // Second call: wrapper already has correct children → replaceChildren NOT called
      fitImagesToViewport(container, 1, true);

      // Same structure on second call (3 rows: solo 0, paired 1+2, solo 3)
      expect(container.children.length).toBe(firstChildCount);
      expect(imgs[1].parentElement).toBe(imgs[2].parentElement);
    });
  });

  describe('cleanupDOM / revertToOriginal (Safety)', () => {
    it('should not crash if elements are already removed or invalid', () => {
      const container = document.createElement('div');

      // 1. cleanupDOM safety
      // Test null container (runtime safety)
      // @ts-expect-error Testing runtime safety
      expect(cleanupDOM(null)).toEqual([]);

      // Test images missing style
      const invalidImg = createMockImage({}); // No style
      const imgs = [invalidImg];
      container.querySelectorAll = vi.fn().mockImplementation((s) => {
        if (s === 'img') return asNodeList(imgs);
        return asNodeList([]);
      });

      // Should not throw when accessing img.style.cssText
      expect(() => cleanupDOM(container)).not.toThrow();


      // 2. revertToOriginal safety
      // Test null container
      // @ts-expect-error Testing runtime safety
      revertToOriginal([], null);

      // Test invalid originalImages
      // @ts-expect-error Testing runtime safety
      revertToOriginal(null, container);

      // Test images missing style or not being nodes
      const invalidOriginalImg = {} as unknown as HTMLImageElement; // Not a node, no style
      revertToOriginal([invalidOriginalImg], container);

      // Verify no crash.
    });

    it('should reset cssText when img has a style property', () => {
      const container = document.createElement('div');

      // img WITH style — covers the true branch of `if (img && img.style)` (line 239)
      const imgWithStyle = createMockImage({ style: { cssText: 'color: red' } });
      container.querySelectorAll = vi.fn().mockImplementation((s) => {
        if (s === 'img') return asNodeList([imgWithStyle]);
        return asNodeList([]);
      });

      cleanupDOM(container);

      // style is a plain object at runtime; cssText should be reset to ''
      expect((imgWithStyle.style as unknown as Record<string, string>).cssText).toBe('');
    });

    it('should call remove() on existing comic-row-wrapper elements', () => {
      // Covers the `wrappers.forEach(w => w.remove())` callback in cleanupDOM
      const container = document.createElement('div');
      const wrapper = document.createElement('div');
      wrapper.className = 'comic-row-wrapper';
      container.appendChild(wrapper);

      container.querySelectorAll = vi.fn().mockImplementation((s) => {
        if (s === 'img') return asNodeList([]);
        if (s === '.comic-row-wrapper') return asNodeList([wrapper]);
        return asNodeList([]);
      });

      cleanupDOM(container);

      // wrapper should have been removed from container
      expect(container.contains(wrapper)).toBe(false);
    });
  });

  describe('Image Loading Utilities (Safety)', () => {
    it('should handle cleanup when removeEventListener is missing', async () => {
      // Covers the FALSE branch of `if (img && typeof img.removeEventListener === 'function')`
      // inside the `cleanup` inner function of waitForImageLoad
      const listeners: Record<string, EventListener> = {};
      const noRemoveImg = {
        complete: false,
        addEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => {
          listeners[event] = cb as EventListener;
        }),
        // No removeEventListener
      } as unknown as HTMLImageElement;

      const promise = waitForImageLoad(noRemoveImg);
      listeners['load']({} as Event);
      await promise;
    });

    it('should handle images missing standard methods', async () => {
      // 1. waitForImageLoad
      // Missing addEventListener
      const dumbImg = {} as unknown as HTMLImageElement;
      await expect(waitForImageLoad(dumbImg)).resolves.toBeUndefined();

      // Null
      // @ts-expect-error Testing runtime safety
      await expect(waitForImageLoad(null)).resolves.toBeUndefined();

      // 2. forceImageLoad
      // Null img — covers `if (!img) return;` TRUE branch
      // @ts-expect-error Testing runtime safety
      expect(() => forceImageLoad(null)).not.toThrow();

      // Missing getAttribute / decode
      const limitedImg = { getAttribute: undefined } as unknown as HTMLImageElement;
      expect(() => forceImageLoad(limitedImg)).not.toThrow();

      // With getAttribute but no decode
      const noDecodeImg = {
        getAttribute: () => 'lazy',
        setAttribute: vi.fn(),
        decode: undefined
      } as unknown as HTMLImageElement;
      expect(() => forceImageLoad(noDecodeImg)).not.toThrow();
      expect(noDecodeImg.setAttribute).toHaveBeenCalledWith('loading', 'eager');

      // 3. preloadImages
      // Null array
      // @ts-expect-error Testing runtime safety
      expect(() => preloadImages(null, 0)).not.toThrow();

      // Array with nulls
      const imgsWithNull = [
        createMockImage({ complete: false }),
        null as unknown as HTMLImageElement,
        createMockImage({ complete: false })
      ];
      expect(() => preloadImages(imgsWithNull, 0, 5)).not.toThrow();
    });

    it('should invoke decode when img has a decode function (forceImageLoad)', async () => {
      // covers line 492: img.decode().catch(() => { })
      const decodeMock = vi.fn().mockRejectedValue(new Error('decode failed'));
      const decodeImg = {
        getAttribute: () => 'lazy',
        setAttribute: vi.fn(),
        decode: decodeMock
      } as unknown as HTMLImageElement;

      expect(() => forceImageLoad(decodeImg)).not.toThrow();
      expect(decodeImg.setAttribute).toHaveBeenCalledWith('loading', 'eager');
      expect(decodeMock).toHaveBeenCalled();

      // Allow the rejected promise to be handled by .catch(() => {})
      await Promise.resolve();
    });

    it('should invoke decode via triggerImageDecode when preloading incomplete images', async () => {
      // covers triggerImageDecode's decode call and catch handler
      const decodeMock = vi.fn().mockRejectedValue(new Error('decode failed'));
      const imgWithDecode = {
        complete: false,
        decode: decodeMock
      } as unknown as HTMLImageElement;

      // currentIndex=0, count=1 → preloads index 1 (imgWithDecode)
      const placeholder = createMockImage({ complete: true });
      expect(() => preloadImages([placeholder, imgWithDecode], 0, 1)).not.toThrow();
      expect(decodeMock).toHaveBeenCalled();

      // Allow the rejected promise to be handled by .catch(() => {})
      await Promise.resolve();
    });
  });

  describe('Discovery Pool Edge Cases (Safety)', () => {
    it('should return 0 candidates when metadata has no relatedWorks', () => {
      // Covers `if (metadata.relatedWorks)` FALSE branch in getDiscoveryPool
      const noWorksMeta = {} as unknown as Metadata;
      expect(getLuckyCandidatesCount(noWorksMeta, [], 'http://any.com')).toBe(0);
    });

    it('should exclude private works and works without href from the pool', () => {
      // Covers `if (!w.isPrivate && w.href)` FALSE branch in getDiscoveryPool
      const privateWorkMeta = {
        relatedWorks: [
          { href: 'http://private.com', isPrivate: true },
          { isPrivate: false }, // no href
        ]
      } as unknown as Metadata;
      expect(getLuckyCandidatesCount(privateWorkMeta, [], 'http://other.com')).toBe(0);
    });

    it('should handle non-array searchCache.results.results via toCandidates guard', () => {
      // Covers `if (!Array.isArray(works)) return []` TRUE branch in toCandidates
      const emptyMeta = { relatedWorks: [] } as unknown as Metadata;
      const badCache = { results: { results: null } } as unknown as SearchCache;
      expect(getLuckyCandidatesCount(emptyMeta, [], 'http://any.com', badCache)).toBe(0);
    });

    it('should skip non-object or href-less elements in toCandidates', () => {
      // Covers the FALSE branch of the object/href condition in toCandidates
      const emptyMeta = { relatedWorks: [] } as unknown as Metadata;
      const badCache = {
        results: {
          results: [null, 'string', 42, { href: 123 }, { noHref: true }]
        }
      } as unknown as SearchCache;
      expect(getLuckyCandidatesCount(emptyMeta, [], 'http://any.com', badCache)).toBe(0);
    });
  });

  describe('normalizeUrl (Safety)', () => {
    afterEach(() => {
      // Restore window.location to a valid state after each test
      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/', origin: 'http://localhost' },
        writable: true,
        configurable: true,
      });
    });

    it('should return the original url when URL parsing fails due to invalid base', () => {
      // Override window.location.origin to an invalid value → new URL(..., invalidBase) throws
      // → catch block at line 566 returns the original url string
      Object.defineProperty(window, 'location', {
        value: { origin: 'not-a-valid-base' },
        writable: true,
        configurable: true,
      });

      expect(normalizeUrl('some-relative-path')).toBe('some-relative-path');
    });
  });

});
