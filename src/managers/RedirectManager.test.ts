import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RedirectManager } from './RedirectManager';
import { createMockStore } from '../test/mocks/store';
import { SiteAdapter, HistoryEntry } from '../types';

const entry = (href: string, lastViewedAt: number): HistoryEntry => ({
  title: href, href, thumb: '', viewCount: 1, firstViewedAt: lastViewedAt, lastViewedAt
});

describe('RedirectManager', () => {
  let replace: ReturnType<typeof vi.fn>;
  const adapter = {
    isWorkPage: (url: string) => url.includes('/magazine/')
  } as unknown as SiteAdapter;

  const stubBrowser = (opts: { url?: string; referrer?: string; navType?: string | null } = {}) => {
    replace = vi.fn();
    vi.stubGlobal('window', { location: { href: opts.url ?? 'https://example.com/', replace } });
    vi.stubGlobal('document', { referrer: opts.referrer ?? '' });
    vi.stubGlobal('performance', {
      getEntriesByType: vi.fn().mockReturnValue(opts.navType === null ? [] : [{ type: opts.navType ?? 'navigate' }])
    });
  };

  beforeEach(() => stubBrowser());
  afterEach(() => vi.unstubAllGlobals());

  it('replaces the location with the last viewed work when enabled', () => {
    const { store } = createMockStore({
      isRedirectEnabled: true,
      luckyHistory: [entry('https://example.com/magazine/1', 1), entry('https://example.com/magazine/2', 2)]
    });
    expect(new RedirectManager(store, adapter).run()).toBe(true);
    expect(replace).toHaveBeenCalledWith('https://example.com/magazine/2');
  });

  it('does nothing when disabled', () => {
    const { store } = createMockStore({
      isRedirectEnabled: false,
      luckyHistory: [entry('https://example.com/magazine/1', 1)]
    });
    expect(new RedirectManager(store, adapter).run()).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });

  it('does nothing when history is empty', () => {
    const { store } = createMockStore({ isRedirectEnabled: true, luckyHistory: [] });
    expect(new RedirectManager(store, adapter).run()).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });

  it('does nothing for in-site navigation (same-origin referrer)', () => {
    stubBrowser({ referrer: 'https://example.com/magazine/1' });
    const { store } = createMockStore({
      isRedirectEnabled: true,
      luckyHistory: [entry('https://example.com/magazine/1', 1)]
    });
    expect(new RedirectManager(store, adapter).run()).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });

  it('does nothing on reload', () => {
    stubBrowser({ navType: 'reload' });
    const { store } = createMockStore({
      isRedirectEnabled: true,
      luckyHistory: [entry('https://example.com/magazine/1', 1)]
    });
    expect(new RedirectManager(store, adapter).run()).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });

  it('treats a missing navigation entry as a normal navigation', () => {
    stubBrowser({ navType: null });
    const { store } = createMockStore({
      isRedirectEnabled: true,
      luckyHistory: [entry('https://example.com/magazine/1', 1)]
    });
    expect(new RedirectManager(store, adapter).run()).toBe(true);
    expect(replace).toHaveBeenCalledWith('https://example.com/magazine/1');
  });
});
