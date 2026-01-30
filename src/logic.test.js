import { describe, it, expect } from 'vitest';
import { calculateVisibleHeight, shouldPairWithNext, getPrimaryVisibleImageIndex } from './logic';

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
      const current = { isLandscape: false, index: 0 };
      const next = { isLandscape: false, index: 1 };
      const options = { isDualViewEnabled: true, alignmentIndex: -1 };
      expect(shouldPairWithNext(current, next, options)).toBe(true);
    });

    it('should return false if dual view is disabled', () => {
      const current = { isLandscape: false, index: 0 };
      const next = { isLandscape: false, index: 1 };
      const options = { isDualViewEnabled: false, alignmentIndex: -1 };
      expect(shouldPairWithNext(current, next, options)).toBe(false);
    });

    it('should return false if current is landscape', () => {
      const current = { isLandscape: true, index: 0 };
      const next = { isLandscape: false, index: 1 };
      const options = { isDualViewEnabled: true, alignmentIndex: -1 };
      expect(shouldPairWithNext(current, next, options)).toBe(false);
    });

    it('should return false if next is alignment target', () => {
      const current = { isLandscape: false, index: 0 };
      const next = { isLandscape: false, index: 1 };
      const options = { isDualViewEnabled: true, alignmentIndex: 1 };
      expect(shouldPairWithNext(current, next, options)).toBe(false);
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
});
