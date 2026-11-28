import { describe, it, expect } from 'vitest';
import {
  getPrimaryVisibleImageIndex,
  normalizeUrl,
  getLuckyCandidatesCount
} from './logic.js';
import { Metadata, SearchCache } from './types.js';
import { createMockImage } from './test/mocks/dom.js';

describe('logic.ts - Safety & Robustness', () => {
  describe('getPrimaryVisibleImageIndex (Safety)', () => {
    it('should return -1 if image list is empty or null', () => {
      expect(getPrimaryVisibleImageIndex([], 1000)).toBe(-1);
      expect(getPrimaryVisibleImageIndex(null, 1000)).toBe(-1);
      expect(getPrimaryVisibleImageIndex(undefined, 1000)).toBe(-1);
    });

    it('should handle elements missing getBoundingClientRect', () => {
      const windowHeight = 1000;
      const validImg = createMockImage({
        getBoundingClientRect: () => ({ top: 0, bottom: 500 })
      });
      const invalidImg = {};
      const nullImg = null;

      const imgs = [nullImg, invalidImg, validImg];

      const result = getPrimaryVisibleImageIndex(imgs, windowHeight);
      expect(result).toBe(2);
    });

    it('should return -1 when all images are below the viewport (visibleHeight = 0)', () => {
      const windowHeight = 1000;
      const belowViewportImg = createMockImage({
        getBoundingClientRect: () => ({ top: 2000, bottom: 2100 })
      });
      expect(getPrimaryVisibleImageIndex([belowViewportImg], windowHeight)).toBe(-1);
    });
  });

  describe('Discovery Pool Edge Cases (Safety)', () => {
    it('should return 0 candidates when metadata has no relatedWorks', () => {
      const noWorksMeta = {} as unknown as Metadata;
      expect(getLuckyCandidatesCount(noWorksMeta, [], 'http://any.com')).toBe(0);
    });

    it('should exclude private works and works without href from the pool', () => {
      const privateWorkMeta = {
        relatedWorks: [
          { href: 'http://private.com', isPrivate: true },
          { isPrivate: false },
        ]
      } as unknown as Metadata;
      expect(getLuckyCandidatesCount(privateWorkMeta, [], 'http://other.com')).toBe(0);
    });

    it('should handle non-array searchCache.results.results via toCandidates guard', () => {
      const emptyMeta = { relatedWorks: [] } as unknown as Metadata;
      const badCache = { results: { results: null } } as unknown as SearchCache;
      expect(getLuckyCandidatesCount(emptyMeta, [], 'http://any.com', badCache)).toBe(0);
    });

    it('should skip non-object or href-less elements in toCandidates', () => {
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
    it('should return the original url when URL parsing fails due to invalid base', () => {
      expect(normalizeUrl('some-relative-path', 'not-a-valid-base')).toBe('some-relative-path');
    });
  });
});
