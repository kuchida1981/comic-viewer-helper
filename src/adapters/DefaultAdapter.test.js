import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DefaultAdapter } from './DefaultAdapter';

describe('DefaultAdapter', () => {
  it('should match any URL', () => {
    expect(DefaultAdapter.match('http://any.url')).toBe(true);
  });

  it('should return container and images via methods', () => {
    const mockContainer = { id: 'post-comic' };
    const mockImg = { src: 'test.jpg' };
    vi.stubGlobal('document', {
      querySelector: vi.fn().mockReturnValue(mockContainer),
      querySelectorAll: vi.fn().mockReturnValue([mockImg])
    });

    expect(DefaultAdapter.getContainer()).toBe(mockContainer);
    expect(DefaultAdapter.getImages()).toEqual([mockImg]);
    expect(document.querySelector).toHaveBeenCalledWith('#post-comic');
    expect(document.querySelectorAll).toHaveBeenCalledWith('#post-comic img');
  });

  describe('getMetadata', () => {
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

      // @ts-ignore - DefaultAdapter has getMetadata
      const result = DefaultAdapter.getMetadata();
      expect(result.title).toBe('My Manga Title');
    });

    it('should extract tags from #post-tag a with type null for unknown paths', () => {
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

      // @ts-ignore
      const result = DefaultAdapter.getMetadata();
      expect(result.tags).toEqual([
        { text: 'Action', href: 'http://tags/action', type: null },
        { text: 'Fantasy', href: 'http://tags/fantasy', type: null }
      ]);
    });

    it('should detect tag type from URL path', () => {
      // @ts-ignore
      document.querySelector.mockReturnValue(null);
      // @ts-ignore
      document.querySelectorAll.mockImplementation(sel => {
        if (sel === '#post-tag a') return [
          { textContent: 'Artist A', href: 'http://example.com/artist/a' },
          { textContent: 'Character B', href: 'http://example.com/character/b' },
          { textContent: 'Circle C', href: 'http://example.com/circle/c' },
          { textContent: 'Fanzine D', href: 'http://example.com/fanzine/d' },
          { textContent: 'Genre E', href: 'http://example.com/genre/e' },
          { textContent: 'Magazine F', href: 'http://example.com/magazine/f' },
          { textContent: 'Parody G', href: 'http://example.com/parody/g' },
          { textContent: 'Unknown', href: 'http://example.com/unknown/x' }
        ];
        return [];
      });

      // @ts-ignore
      const result = DefaultAdapter.getMetadata();
      expect(result.tags).toEqual([
        { text: 'Artist A', href: 'http://example.com/artist/a', type: 'artist' },
        { text: 'Character B', href: 'http://example.com/character/b', type: 'character' },
        { text: 'Circle C', href: 'http://example.com/circle/c', type: 'circle' },
        { text: 'Fanzine D', href: 'http://example.com/fanzine/d', type: 'fanzine' },
        { text: 'Genre E', href: 'http://example.com/genre/e', type: 'genre' },
        { text: 'Magazine F', href: 'http://example.com/magazine/f', type: 'magazine' },
        { text: 'Parody G', href: 'http://example.com/parody/g', type: 'parody' },
        { text: 'Unknown', href: 'http://example.com/unknown/x', type: null }
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

      // @ts-ignore
      const result = DefaultAdapter.getMetadata();
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

      // @ts-ignore
      const result = DefaultAdapter.getMetadata();
      expect(result.relatedWorks[0].title).toBe('Title from Anchor');
    });

    it('should provide default values if elements not found', () => {
      // @ts-ignore
      document.querySelector.mockReturnValue(null);
      // @ts-ignore
      document.querySelectorAll.mockReturnValue([]);

      // @ts-ignore
      const result = DefaultAdapter.getMetadata();
      expect(result).toEqual({
        title: 'Unknown Title',
        tags: [],
        relatedWorks: []
      });
    });
  });
});
