import { describe, it, expect, vi } from 'vitest';
import {
  calculateVisibleHeight,
  shouldPairWithNext,
  getPrimaryVisibleImageIndex,
  getNavigationDirection,
  normalizeUrl,
  pickRandomWork,
  getLuckyCandidatesCount,
  isLuckyPoolDepleted,
  calculateTrends,
  calculateTagCloudLevel,
  getTagTypes,
  toggleTagTypeFilter,
  arrangeTagCloud,
  filterWorksByTags,
  encrypt,
  decrypt,
  isEncrypted,
  resolveRedirectTarget,
  RedirectContext
} from './logic';

import { Metadata } from './types.js';
import { createMockImage } from './test/mocks/dom.js';

describe('logic.ts', () => {

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

  describe('normalizeUrl', () => {
    it('should remove query parameters and hashes', () => {
      expect(normalizeUrl('https://example.com/work/123?page=5#top')).toBe('https://example.com/work/123');
    });

    it('should handle relative URLs by resolving against baseOrigin', () => {
      expect(normalizeUrl('/work/456', 'https://site.com')).toBe('https://site.com/work/456');
    });

    it('should return normalized URL even for strings that resolve against default base', () => {
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

describe('calculateTrends (excludedTypes)', () => {
  const works = [
    {
      title: 'A', href: '/work/1/', thumb: '',
      tags: [
        { text: 'fantasy', href: '/t/fantasy', type: 'genre' },
        { text: 'alice', href: '/t/alice', type: 'artist' },
        { text: 'misc', href: '/t/misc', type: null }
      ]
    },
    {
      title: 'B', href: '/work/2/', thumb: '',
      tags: [{ text: 'fantasy', href: '/t/fantasy', type: 'genre' }]
    }
  ];

  it('should not exclude anything by default', () => {
    expect(calculateTrends(works, 0)).toHaveLength(3);
  });

  it('should exclude tags of the given type', () => {
    const trends = calculateTrends(works, 0, [], [], new Set(['genre']));
    expect(trends.map(t => t.tag.text).sort()).toEqual(['alice', 'misc']);
  });

  it('should exclude untyped tags when null is given', () => {
    const trends = calculateTrends(works, 0, [], [], new Set([null]));
    expect(trends.map(t => t.tag.text).sort()).toEqual(['alice', 'fantasy']);
  });

  it('should return empty when all types are excluded', () => {
    const trends = calculateTrends(works, 0, [], [], new Set(['genre', 'artist', null]));
    expect(trends).toHaveLength(0);
  });

  it('should apply the limit after exclusion', () => {
    const many = {
      title: 'M', href: '/work/9/', thumb: '',
      tags: [
        ...Array.from({ length: 5 }, (_, i) => ({ text: `g${i}`, href: `/t/g${i}`, type: 'genre' })),
        { text: 'a0', href: '/t/a0', type: 'artist' },
        { text: 'a1', href: '/t/a1', type: 'artist' }
      ]
    };
    const trends = calculateTrends([many], 2, [], [], new Set(['genre']));
    expect(trends.map(t => t.tag.text).sort()).toEqual(['a0', 'a1']);
  });
});

describe('arrangeTagCloud', () => {
  const item = (text: string, count: number) => ({ tag: { text }, count });
  const texts = (items: Array<{ tag: { text: string } }>) => items.map(i => i.tag.text);

  it('should place the most frequent item in the center (odd count)', () => {
    const items = [item('E', 1), item('A', 5), item('C', 3), item('B', 4), item('D', 2)];
    expect(texts(arrangeTagCloud(items))).toEqual(['E', 'C', 'A', 'B', 'D']);
  });

  it('should handle an even number of items', () => {
    const items = [item('A', 4), item('B', 3), item('C', 2), item('D', 1)];
    expect(texts(arrangeTagCloud(items))).toEqual(['C', 'A', 'B', 'D']);
  });

  it('should break ties by text ascending', () => {
    const items = [item('b', 2), item('c', 2), item('a', 2)];
    expect(texts(arrangeTagCloud(items))).toEqual(['c', 'a', 'b']);
  });

  it('should return a single item as is', () => {
    expect(texts(arrangeTagCloud([item('only', 1)]))).toEqual(['only']);
  });

  it('should return empty for empty input', () => {
    expect(arrangeTagCloud([])).toEqual([]);
  });

  it('should not modify the input array', () => {
    const items = [item('B', 1), item('A', 2)];
    arrangeTagCloud(items);
    expect(texts(items)).toEqual(['B', 'A']);
  });
});

describe('getTagTypes', () => {
  it('should return distinct types sorted with null last', () => {
    const works = [
      { title: 'A', href: '/1/', thumb: '', tags: [
        { text: 'x', href: '/x', type: 'genre' },
        { text: 'y', href: '/y', type: null },
        { text: 'z', href: '/z', type: 'artist' }
      ] },
      { title: 'B', href: '/2/', thumb: '', tags: [{ text: 'x2', href: '/x2', type: 'genre' }] }
    ];
    expect(getTagTypes(works)).toEqual(['artist', 'genre', null]);
  });

  it('should omit null when all tags are typed', () => {
    const works = [{ title: 'A', href: '/1/', thumb: '', tags: [{ text: 'x', href: '/x', type: 'genre' }] }];
    expect(getTagTypes(works)).toEqual(['genre']);
  });

  it('should return empty for works without tags', () => {
    expect(getTagTypes([{ title: 'A', href: '/1/', thumb: '' }])).toEqual([]);
    expect(getTagTypes([])).toEqual([]);
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
  describe('resolveRedirectTarget', () => {
    const isWorkUrl = (url: string) => /\/magazine\//.test(url);
    const base: RedirectContext = {
      enabled: true,
      currentUrl: 'https://example.com/',
      referrer: '',
      navigationType: 'navigate',
      history: [
        { href: 'https://example.com/magazine/1', lastViewedAt: 100 },
        { href: 'https://example.com/magazine/2', lastViewedAt: 300 },
        { href: 'https://example.com/magazine/3', lastViewedAt: 200 }
      ],
      isWorkUrl
    };

    it('redirects to the most recently viewed work (not the first element)', () => {
      expect(resolveRedirectTarget(base)).toBe('https://example.com/magazine/2');
    });

    it('redirects when the referrer is from another origin', () => {
      expect(resolveRedirectTarget({ ...base, referrer: 'https://other.example.org/page' }))
        .toBe('https://example.com/magazine/2');
    });

    it('redirects when the referrer cannot be parsed', () => {
      expect(resolveRedirectTarget({ ...base, referrer: 'not a url' }))
        .toBe('https://example.com/magazine/2');
    });

    it('does not redirect when disabled', () => {
      expect(resolveRedirectTarget({ ...base, enabled: false })).toBeNull();
    });

    it('does not redirect on a work page', () => {
      expect(resolveRedirectTarget({ ...base, currentUrl: 'https://example.com/magazine/9' })).toBeNull();
    });

    it.each(['reload', 'back_forward'])('does not redirect on %s navigation', (navigationType) => {
      expect(resolveRedirectTarget({ ...base, navigationType })).toBeNull();
    });

    it('does not redirect on in-site navigation (same-origin referrer)', () => {
      expect(resolveRedirectTarget({ ...base, referrer: 'https://example.com/magazine/1' })).toBeNull();
    });

    it('does not redirect when history is empty', () => {
      expect(resolveRedirectTarget({ ...base, history: [] })).toBeNull();
    });

    it('does not redirect when the target equals the current URL', () => {
      const ctx = {
        ...base,
        currentUrl: 'https://example.com/foo?x=1',
        history: [{ href: 'https://example.com/foo', lastViewedAt: 1 }],
        isWorkUrl: () => false
      };
      expect(resolveRedirectTarget(ctx)).toBeNull();
    });

    it('does not redirect when the target is not a work page (no loop)', () => {
      const ctx = { ...base, history: [{ href: 'https://example.com/search', lastViewedAt: 1 }] };
      expect(resolveRedirectTarget(ctx)).toBeNull();
    });
  });
});

describe('calculateTagCloudLevel', () => {
  it('最小件数は最小段階を返す', () => {
    expect(calculateTagCloudLevel(1, 1, 10)).toBe(1);
  });

  it('最大件数は最大段階を返す', () => {
    expect(calculateTagCloudLevel(10, 1, 10)).toBe(5);
  });

  it('中間の件数は線形に段階が決まる', () => {
    expect(calculateTagCloudLevel(5, 1, 9)).toBe(3);
    expect(calculateTagCloudLevel(3, 1, 9)).toBe(2);
  });

  it('min と max が等しい場合は中間段階を返す', () => {
    expect(calculateTagCloudLevel(3, 3, 3)).toBe(3);
    expect(calculateTagCloudLevel(3, 3, 3, 4)).toBe(2);
  });

  it('範囲外の件数は 1..levels にクランプされる', () => {
    expect(calculateTagCloudLevel(0, 1, 10)).toBe(1);
    expect(calculateTagCloudLevel(20, 1, 10)).toBe(5);
  });

  it('levels を指定できる', () => {
    expect(calculateTagCloudLevel(10, 1, 10, 3)).toBe(3);
  });
});

describe('toggleTagTypeFilter', () => {
  const allTypes: Array<string | null> = ['artist', 'genre', null];

  it('全選択状態で種類をクリックすると、その種類以外がすべて除外される', () => {
    const result = toggleTagTypeFilter(new Set(), allTypes, 'genre');
    expect(result).toEqual(new Set(['artist', null]));
  });

  it('除外されている種類をクリックすると、除外から外れて選択状態になる', () => {
    const excluded = new Set<string | null>(['artist', null]);
    const result = toggleTagTypeFilter(excluded, allTypes, 'artist');
    expect(result).toEqual(new Set([null]));
  });

  it('複数選択中に選択済みの種類をクリックすると、その種類が除外される', () => {
    const excluded = new Set<string | null>([null]);
    const result = toggleTagTypeFilter(excluded, allTypes, 'genre');
    expect(result).toEqual(new Set([null, 'genre']));
  });

  it('最後の1種類を選択中にクリックしても除外されない', () => {
    const excluded = new Set<string | null>(['artist', null]);
    const result = toggleTagTypeFilter(excluded, allTypes, 'genre');
    expect(result).toEqual(new Set(['artist', null]));
  });

  it('元の Set を変更しない', () => {
    const excluded = new Set<string | null>(['artist']);
    const result = toggleTagTypeFilter(excluded, allTypes, null);
    expect(excluded).toEqual(new Set(['artist']));
    expect(result).toEqual(new Set(['artist', null]));
  });
});
