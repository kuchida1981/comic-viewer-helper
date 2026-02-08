import { assert, describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { DefaultAdapter } from './DefaultAdapter.js';
import { isSearchableAdapter, isMetadataAdapter } from '../types';

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

    vi.unstubAllGlobals();
  });

  describe('getSearchUrl', () => {
    it('should return correct search URL with default config', () => {
      // Set default window.location.origin
      vi.stubGlobal('location', { origin: 'http://example.com' });
      
      const query = 'test keyword';
      assert(isSearchableAdapter(DefaultAdapter), 'DefaultAdapter should be SearchableAdapter');
      const result = DefaultAdapter.getSearchUrl(query);
      
      const url = new URL(result);
      expect(url.origin).toBe('http://example.com');
      expect(url.pathname).toBe('/');
      expect(url.searchParams.get('s')).toBe('test keyword');

      vi.unstubAllGlobals();
    });

    it('should use custom searchConfig if provided', () => {
      const originalConfig = DefaultAdapter.searchConfig;
      DefaultAdapter.searchConfig = {
        baseUrl: 'https://search.com/find',
        queryParam: 'q'
      };

      assert(isSearchableAdapter(DefaultAdapter), 'DefaultAdapter should be SearchableAdapter');
      const result = DefaultAdapter.getSearchUrl('hello');
      expect(result).toBe('https://search.com/find?q=hello');

      // Restore
      DefaultAdapter.searchConfig = originalConfig;
    });
  });

  describe('parseSearchResults', () => {
    const parse = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      assert(isSearchableAdapter(DefaultAdapter), 'DefaultAdapter should be SearchableAdapter');
      return DefaultAdapter.parseSearchResults(doc);
    };

    it('should extract results from div.post-list > a', () => {
      const html = `
        <div class="post-list">
          <a href="/fanzine/100/">
            <div class="post-list-image"><img src="/thumb/100.webp"></div>
            <span>Title A</span>
            <div class="post-list-time">2020-01-01</div>
          </a>
          <a href="/fanzine/200/">
            <div class="post-list-image"><img src="/thumb/200.webp"></div>
            <span>Title B</span>
          </a>
        </div>
      `;
      const result = parse(html);
      expect(result.results).toEqual([
        { title: 'Title A', href: '/fanzine/100/', thumb: '/thumb/100.webp' },
        { title: 'Title B', href: '/fanzine/200/', thumb: '/thumb/200.webp' }
      ]);
    });

    it('should extract totalCount from div.page-h > span', () => {
      const html = `
        <div class="page-h"><h3>検索</h3><h1>Keyword</h1><span>64,786件</span></div>
        <div class="post-list"></div>
      `;
      const result = parse(html);
      expect(result.totalCount).toBe('64,786件');
    });

    it('should return totalCount as null if div.page-h > span is absent', () => {
      const html = `<div class="post-list"></div>`;
      const result = parse(html);
      expect(result.totalCount).toBeNull();
    });

    it('should extract nextPageUrl from a.nextpostslink inside div.wp-pagenavi', () => {
      const html = `
        <div class="post-list"></div>
        <div class="wp-pagenavi" role="navigation">
          <span class="current">1</span>
          <a class="page larger" href="/page/2/?s=kw">2</a>
          <a class="nextpostslink" rel="next" href="/page/2/?s=kw">›</a>
        </div>
      `;
      const result = parse(html);
      expect(result.nextPageUrl).toBe('/page/2/?s=kw');
    });

    it('should return nextPageUrl as null if wp-pagenavi or nextpostslink is absent', () => {
      const html = `<div class="post-list"></div>`;
      const result = parse(html);
      expect(result.nextPageUrl).toBeNull();
    });

    it('should extract pagination information from wp-pagenavi', () => {
      const html = `
        <div class="post-list"></div>
        <div class="wp-pagenavi" role="navigation">
          <span class="pages">1 / 1,296</span>
          <span aria-current="page" class="current">1</span>
          <a class="page larger" href="/page/2/?s=kw">2</a>
          <span class="extend">...</span>
          <a class="nextpostslink" rel="next" href="/page/2/?s=kw">›</a>
          <a class="last" href="/page/1296/?s=kw">最後 »</a>
        </div>
      `;
      const result = parse(html);
      expect(result.pagination).toEqual([
        { label: '1', url: null, isCurrent: true, type: 'page' },
        { label: '2', url: '/page/2/?s=kw', isCurrent: false, type: 'page' },
        { label: '...', url: null, isCurrent: false, type: 'extend' },
        { label: '›', url: '/page/2/?s=kw', isCurrent: false, type: 'next' },
        { label: '最後 »', url: '/page/1296/?s=kw', isCurrent: false, type: 'page' }
      ]);
    });

    it('should return empty results array when post-list has no children', () => {
      const html = `<div class="post-list"></div>`;
      const result = parse(html);
      expect(result.results).toEqual([]);
    });
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
      (document.querySelector as Mock).mockImplementation(sel => {
        if (sel === 'h1') return { textContent: ' My Manga Title ' };
        return null;
      });
      (document.querySelectorAll as Mock).mockReturnValue([]);

      assert(isMetadataAdapter(DefaultAdapter), 'DefaultAdapter should be MetadataAdapter');
      const result = DefaultAdapter.getMetadata();
      expect(result.title).toBe('My Manga Title');
    });

    it('should extract tags from #post-tag a with type null for unknown paths', () => {
      (document.querySelector as Mock).mockReturnValue(null);
      (document.querySelectorAll as Mock).mockImplementation(sel => {
        if (sel === '#post-tag a') return [
          { textContent: 'Action', href: 'http://tags/action' },
          { textContent: 'Fantasy', href: 'http://tags/fantasy' }
        ];
        return [];
      });

      assert(isMetadataAdapter(DefaultAdapter), 'DefaultAdapter should be MetadataAdapter');
      const result = DefaultAdapter.getMetadata();
      expect(result.tags).toEqual([
        { text: 'Action', href: 'http://tags/action', type: null },
        { text: 'Fantasy', href: 'http://tags/fantasy', type: null }
      ]);
    });

    it('should detect tag type from URL path', () => {
      (document.querySelector as Mock).mockReturnValue(null);
      (document.querySelectorAll as Mock).mockImplementation(sel => {
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

      assert(isMetadataAdapter(DefaultAdapter), 'DefaultAdapter should be MetadataAdapter');
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
      (document.querySelector as Mock).mockReturnValue(null);
      (document.querySelectorAll as Mock).mockImplementation(sel => {
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

      assert(isMetadataAdapter(DefaultAdapter), 'DefaultAdapter should be MetadataAdapter');
      const result = DefaultAdapter.getMetadata();
      expect(result.relatedWorks).toEqual([
        { title: 'Related Work 1', href: 'http://work/1', thumb: 'thumb1.jpg', isPrivate: false }
      ]);
    });

    it('should extract title from anchor span if not found in .post-list-image span', () => {
      (document.querySelector as Mock).mockReturnValue(null);
      (document.querySelectorAll as Mock).mockImplementation(sel => {
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

      assert(isMetadataAdapter(DefaultAdapter), 'DefaultAdapter should be MetadataAdapter');
      const result = DefaultAdapter.getMetadata();
      expect(result.relatedWorks[0].title).toBe('Title from Anchor');
    });

    it('should provide default values if elements not found', () => {
      (document.querySelector as Mock).mockReturnValue(null);
      (document.querySelectorAll as Mock).mockReturnValue([]);

      assert(isMetadataAdapter(DefaultAdapter), 'DefaultAdapter should be MetadataAdapter');
      const result = DefaultAdapter.getMetadata();
      expect(result).toEqual({
        title: 'Unknown Title',
        tags: [],
        relatedWorks: []
      });
    });
  });
});