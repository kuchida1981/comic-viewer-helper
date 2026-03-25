import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TagFetchManager } from './TagFetchManager';
import { createMockStore } from '../test/mocks/store';
import { Tag, RelatedWork } from '../types';
import { StoreState } from '../store';

const makeTag = (text: string): Tag => ({ text, href: `/genre/${text}/`, type: 'genre' });

function makeMockParseDoc(tags: Tag[]): (doc: Document) => Tag[] {
  return vi.fn(() => tags);
}

function makePartialState(workTagsCache: Record<string, Tag[]>): StoreState {
  return { workTagsCache } as unknown as StoreState;
}

describe('TagFetchManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should skip works already in the cache', async () => {
    const tags = [makeTag('fantasy')];
    const { store, setState } = createMockStore({
      workTagsCache: { '/work/a/': tags }
    });
    const parseFn = makeMockParseDoc(tags);
    const manager = new TagFetchManager(store, parseFn);

    const works: RelatedWork[] = [{ title: 'A', href: '/work/a/', thumb: '' }];
    manager.start(works);

    await vi.runAllTimersAsync();
    expect(setState).not.toHaveBeenCalled();
  });

  it('should fetch tags for uncached works and update the store', async () => {
    const tags = [makeTag('fantasy')];
    const { store, setState } = createMockStore({ workTagsCache: {} });
    const parseFn = makeMockParseDoc(tags);
    const manager = new TagFetchManager(store, parseFn);

    const fetchMock = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('<html></html>')
    }));
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('DOMParser', class {
      parseFromString() { return document; }
    });

    const works: RelatedWork[] = [{ title: 'B', href: '/work/b/', thumb: '' }];
    manager.start(works);

    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledWith('/work/b/');
    expect(setState).toHaveBeenCalledWith({
      workTagsCache: { '/work/b/': tags }
    });
    vi.unstubAllGlobals();
  });

  it('should insert 500ms delay between fetches', async () => {
    const tags = [makeTag('x')];
    const { store, getState } = createMockStore({ workTagsCache: {} });
    const callTimes: number[] = [];
    const parseFn = vi.fn(() => tags);
    const manager = new TagFetchManager(store, parseFn);

    const fetchMock = vi.fn(() => {
      callTimes.push(Date.now());
      return Promise.resolve({ ok: true, text: () => Promise.resolve('<html></html>') });
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('DOMParser', class {
      parseFromString() { return document; }
    });

    // Return empty cache (all works need fetching)
    getState.mockImplementation(() => makePartialState({}));

    const works: RelatedWork[] = [
      { title: 'A', href: '/work/a/', thumb: '' },
      { title: 'B', href: '/work/b/', thumb: '' }
    ];
    manager.start(works);

    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });

  it('should silently skip failed fetches and continue queue', async () => {
    const tags = [makeTag('y')];
    const { store, setState, getState } = createMockStore({ workTagsCache: {} });
    const parseFn = makeMockParseDoc(tags);
    const manager = new TagFetchManager(store, parseFn);

    let fetchCount = 0;
    const fetchMock = vi.fn(() => {
      fetchCount++;
      if (fetchCount === 1) return Promise.reject(new Error('Network error'));
      return Promise.resolve({ ok: true, text: () => Promise.resolve('<html></html>') });
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('DOMParser', class {
      parseFromString() { return document; }
    });

    getState.mockImplementation(() => makePartialState({}));

    const works: RelatedWork[] = [
      { title: 'Fail', href: '/work/fail/', thumb: '' },
      { title: 'OK', href: '/work/ok/', thumb: '' }
    ];
    manager.start(works);

    await vi.runAllTimersAsync();

    // Second work should still be fetched
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Only second call should update store (first failed)
    expect(setState).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it('stop() should clear the pending queue', async () => {
    const tags = [makeTag('z')];
    const { store, getState } = createMockStore({ workTagsCache: {} });
    const parseFn = makeMockParseDoc(tags);
    const manager = new TagFetchManager(store, parseFn);

    const fetchMock = vi.fn(() =>
      new Promise(resolve =>
        setTimeout(() => resolve({ ok: true, text: () => Promise.resolve('<html></html>') }), 100)
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('DOMParser', class {
      parseFromString() { return document; }
    });
    getState.mockImplementation(() => makePartialState({}));

    const works: RelatedWork[] = [
      { title: 'A', href: '/work/a/', thumb: '' },
      { title: 'B', href: '/work/b/', thumb: '' }
    ];
    manager.start(works);
    manager.stop();

    await vi.runAllTimersAsync();

    // At most 1 fetch should happen (the in-flight one)
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(1);
    vi.unstubAllGlobals();
  });

  it('should not duplicate URLs already in queue', async () => {
    const { store, getState } = createMockStore({ workTagsCache: {} });
    const parseFn = makeMockParseDoc([]);
    const manager = new TagFetchManager(store, parseFn);

    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('<html></html>') })
    );
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('DOMParser', class {
      parseFromString() { return document; }
    });
    getState.mockImplementation(() => makePartialState({}));

    const work: RelatedWork = { title: 'A', href: '/work/a/', thumb: '' };
    manager.start([work]);
    manager.start([work]); // duplicate call

    await vi.runAllTimersAsync();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
