import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getImageElementByIndex,
  revertToOriginal,
  fitImagesToViewport,
  cleanupDOM,
  waitForImageLoad,
  preloadImages,
  forceImageLoad,
  getClickNavigationDirection
} from './dom';
import { createMockImage, asNodeList } from './test/mocks/dom.js';

describe('dom.ts', () => {
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
      revertToOriginal(originalImages, null);
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

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string, options?: ElementCreationOptions) => {
        const el = originalCreateElement(tagName, options);
        createdElements.push(el);
        return el;
      });

      vi.stubGlobal('window', { ...window, innerWidth: 1000, innerHeight: 1000 });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should correctly handle multiple landscape images', () => {
      Object.defineProperty(images[1], 'naturalWidth', { value: 500 });
      Object.defineProperty(images[1], 'naturalHeight', { value: 100 });
      Object.defineProperty(images[2], 'naturalWidth', { value: 500 });
      Object.defineProperty(images[2], 'naturalHeight', { value: 100 });

      fitImagesToViewport(container, 0, true);
      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(container.children.length).toBe(4);
    });

    it('should show first page (index 0) and last page as solo regardless of offset', () => {
      fitImagesToViewport(container, 0, true);

      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[2].children[0]).toBe(images[2]);
      expect(wrappers[3].children[0]).toBe(images[3]);
    });

    it('should show first page (index 0) and last page as solo with offset 1', () => {
      fitImagesToViewport(container, 1, true);

      const wrappers = createdElements.filter(e => e.tagName === 'DIV');
      expect(wrappers.length).toBe(3);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[1].children[1]).toBe(images[2]);
      expect(wrappers[2].children[0]).toBe(images[3]);
    });

    it('should show all pages as solo when there are only 2 pages', () => {
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
      Object.defineProperty(images[1], 'naturalWidth', { value: 500 });
      Object.defineProperty(images[1], 'naturalHeight', { value: 100 });

      fitImagesToViewport(container, 0, true);

      expect(container.children.length).toBe(4);
      const wrappers = Array.from(container.children).filter(el => el.tagName === 'DIV');
      expect(wrappers.length).toBe(4);
      expect(wrappers[0].children[0]).toBe(images[0]);
      expect(wrappers[1].children[0]).toBe(images[1]);
      expect(wrappers[2].children[0]).toBe(images[2]);
      expect(wrappers[3].children[0]).toBe(images[3]);
    });

    it('should show all pages as solo for 3 images with offset 1', () => {
      images[3].remove();
      const threeImages = images.slice(0, 3);

      fitImagesToViewport(container, 1, true);
      const wrappers = Array.from(container.children).filter(el => el.tagName === 'DIV');
      expect(wrappers.length).toBe(3);
      expect(wrappers[0].children[0]).toBe(threeImages[0]);
      expect(wrappers[1].children[0]).toBe(threeImages[1]);
      expect(wrappers[2].children[0]).toBe(threeImages[2]);
    });

    it('should remove unused wrappers', () => {
      const extraWrapper = document.createElement('div');
      extraWrapper.className = 'comic-row-wrapper';
      container.appendChild(extraWrapper);

      images.forEach(img => img.remove());

      fitImagesToViewport(container, 0, true);

      expect(container.querySelector('.comic-row-wrapper')).toBeNull();
      expect(extraWrapper.parentElement).toBeNull();
    });

    it('should do nothing if container is null', () => {
      fitImagesToViewport(null, 0, true);
    });

    it('should reuse existing wrappers when called with same state (Reconciliation)', () => {
      fitImagesToViewport(container, 0, true);
      const firstPassWrappers = Array.from(container.children) as HTMLElement[];
      expect(firstPassWrappers.length).toBeGreaterThan(0);

      createdElements.length = 0;

      fitImagesToViewport(container, 0, true);

      const secondPassWrappers = Array.from(container.children) as HTMLElement[];

      expect(secondPassWrappers.length).toBe(firstPassWrappers.length);
      expect(secondPassWrappers[0]).toBe(firstPassWrappers[0]);
      expect(createdElements.length).toBe(0);
    });
  });

  describe('getClickNavigationDirection', () => {
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

  describe('Safety & Robustness', () => {
    describe('fitImagesToViewport (Safety)', () => {
      it('should safely skip invalid image elements', () => {
        const container = document.createElement('div');

        const validImg = document.createElement('img');
        Object.defineProperty(validImg, 'naturalWidth', { value: 100, configurable: true });
        Object.defineProperty(validImg, 'naturalHeight', { value: 100, configurable: true });

        const invalidImg = document.createElement('img');
        Object.defineProperty(invalidImg, 'naturalWidth', { value: undefined, configurable: true });

        const imgs = [validImg, invalidImg];

        container.querySelectorAll = vi.fn().mockImplementation((selector) => {
          if (selector === 'img') return asNodeList(imgs);
          if (selector === '.comic-row-wrapper') return asNodeList([]);
          return asNodeList([]);
        });

        vi.stubGlobal('innerWidth', 1024);
        vi.stubGlobal('innerHeight', 768);

        expect(() => fitImagesToViewport(container)).not.toThrow();
        expect(validImg.style.maxWidth).not.toBe('');
        expect(invalidImg.style.maxWidth).toBe('');
      });

      it('should skip pairing when both images are landscape in dual-view mode', () => {
        const container = document.createElement('div');
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

        expect(() => fitImagesToViewport(container, 0, true)).not.toThrow();
        expect(container.children.length).toBe(5);
      });

      it('should skip pairing when next image is landscape (portrait + landscape pair)', () => {
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
        const container = document.createElement('div');
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

        fitImagesToViewport(container, 1, true);
        const firstChildCount = container.children.length;

        fitImagesToViewport(container, 1, true);

        expect(container.children.length).toBe(firstChildCount);
        expect(imgs[1].parentElement).toBe(imgs[2].parentElement);
      });
    });

    describe('cleanupDOM / revertToOriginal (Safety)', () => {
      it('should not crash if elements are already removed or invalid', () => {
        const container = document.createElement('div');

        expect(cleanupDOM(null)).toEqual([]);

        const invalidImg = createMockImage({});
        const imgs = [invalidImg];
        container.querySelectorAll = vi.fn().mockImplementation((s) => {
          if (s === 'img') return asNodeList(imgs);
          return asNodeList([]);
        });

        expect(() => cleanupDOM(container)).not.toThrow();

        revertToOriginal([], null);
        revertToOriginal(null, container);

        const invalidOriginalImg = {} as unknown as HTMLImageElement;
        revertToOriginal([invalidOriginalImg], container);
      });

      it('should reset cssText when img has a style property', () => {
        const container = document.createElement('div');
        const imgWithStyle = createMockImage({ style: { cssText: 'color: red' } });
        container.querySelectorAll = vi.fn().mockImplementation((s) => {
          if (s === 'img') return asNodeList([imgWithStyle]);
          return asNodeList([]);
        });

        cleanupDOM(container);
        expect((imgWithStyle.style as unknown as Record<string, string>).cssText).toBe('');
      });

      it('should call remove() on existing comic-row-wrapper elements', () => {
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
        expect(container.contains(wrapper)).toBe(false);
      });
    });

    describe('Image Loading Utilities (Safety)', () => {
      it('should handle cleanup when removeEventListener is missing', async () => {
        const listeners: Record<string, EventListener> = {};
        const noRemoveImg = {
          complete: false,
          addEventListener: vi.fn((event: string, cb: EventListenerOrEventListenerObject) => {
            listeners[event] = cb as EventListener;
          })
        } as unknown as HTMLImageElement;

        const promise = waitForImageLoad(noRemoveImg);
        listeners['load']({} as Event);
        await promise;
      });

      it('should handle images missing standard methods', async () => {
        const dumbImg = {} as unknown as HTMLImageElement;
        await expect(waitForImageLoad(dumbImg)).resolves.toBeUndefined();
        await expect(waitForImageLoad(null)).resolves.toBeUndefined();

        expect(() => forceImageLoad(null)).not.toThrow();

        const limitedImg = { getAttribute: undefined } as unknown as HTMLImageElement;
        expect(() => forceImageLoad(limitedImg)).not.toThrow();

        const noDecodeImg = {
          getAttribute: () => 'lazy',
          setAttribute: vi.fn(),
          decode: undefined
        } as unknown as HTMLImageElement;
        expect(() => forceImageLoad(noDecodeImg)).not.toThrow();
        expect(noDecodeImg.setAttribute).toHaveBeenCalledWith('loading', 'eager');

        expect(() => preloadImages(null, 0)).not.toThrow();

        const imgsWithNull = [
          createMockImage({ complete: false }),
          null,
          createMockImage({ complete: false })
        ];
        expect(() => preloadImages(imgsWithNull, 0, 5)).not.toThrow();
      });

      it('should invoke decode when img has a decode function (forceImageLoad)', async () => {
        const decodeMock = vi.fn().mockRejectedValue(new Error('decode failed'));
        const decodeImg = {
          getAttribute: () => 'lazy',
          setAttribute: vi.fn(),
          decode: decodeMock
        } as unknown as HTMLImageElement;

        expect(() => forceImageLoad(decodeImg)).not.toThrow();
        expect(decodeImg.setAttribute).toHaveBeenCalledWith('loading', 'eager');
        expect(decodeMock).toHaveBeenCalled();

        await Promise.resolve();
      });

      it('should invoke decode via triggerImageDecode when preloading incomplete images', async () => {
        const decodeMock = vi.fn().mockRejectedValue(new Error('decode failed'));
        const imgWithDecode = {
          complete: false,
          decode: decodeMock
        } as unknown as HTMLImageElement;

        const placeholder = createMockImage({ complete: true });
        expect(() => preloadImages([placeholder, imgWithDecode], 0, 1)).not.toThrow();
        expect(decodeMock).toHaveBeenCalled();

        await Promise.resolve();
      });
    });
  });
});
