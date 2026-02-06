import { describe, it, expect, vi } from 'vitest';
import { 
  getPrimaryVisibleImageIndex, 
  fitImagesToViewport, 
  revertToOriginal, 
  cleanupDOM,
  waitForImageLoad, 
  preloadImages,
  forceImageLoad
} from './logic.js';
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
  });

  describe('Image Loading Utilities (Safety)', () => {
    it('should handle images missing standard methods', async () => {
      // 1. waitForImageLoad
      // Missing addEventListener
      const dumbImg = {} as unknown as HTMLImageElement;
      await expect(waitForImageLoad(dumbImg)).resolves.toBeUndefined();
      
      // Null
      // @ts-expect-error Testing runtime safety
      await expect(waitForImageLoad(null)).resolves.toBeUndefined();

      // 2. forceImageLoad
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
  });

});
