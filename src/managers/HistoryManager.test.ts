import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { HistoryManager } from './HistoryManager';

// Simple mock for IndexedDB
const mockDB = {
  history: new Map<string, unknown>()
};

vi.mock('../utils/indexedDB', () => {
  return {
    IndexedDBWrapper: class {
      put = vi.fn(async (_store: string, item: { url: string }) => {
        mockDB.history.set(item.url, item);
      });
      getAll = vi.fn(async () => {
        return Array.from(mockDB.history.values());
      });
      delete = vi.fn(async (_store: string, key: string) => {
        mockDB.history.delete(key);
      });
      clear = vi.fn(async () => {
        mockDB.history.clear();
      });
      open = vi.fn(async () => ({}));
    }
  };
});

describe('HistoryManager', () => {
  let historyManager: HistoryManager;

  beforeEach(() => {
    mockDB.history.clear();
    historyManager = new HistoryManager();
  });

  it('should save history', async () => {
    const metadata = {
      title: 'Test Manga',
      tags: [{ text: 'Tag1', href: '#1', type: 'genre' }],
      relatedWorks: [{ title: 'Other', href: '#2', thumb: 'thumb.jpg', isPrivate: false }]
    };
    const url = 'http://example.com/1';

    await historyManager.saveHistory(metadata, url);

    const history = await historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].title).toBe('Test Manga');
    expect(history[0].url).toBe(url);
    expect(history[0].thumb).toBe('thumb.jpg');
  });

  it('should sort history by date descending', async () => {
    const meta1 = { title: 'Manga 1', tags: [], relatedWorks: [] };
    const meta2 = { title: 'Manga 2', tags: [], relatedWorks: [] };

    // Mock Date.now to control order
    const now = Date.now();
    const spy = vi.spyOn(Date, 'now');
    
    spy.mockReturnValue(now);
    await historyManager.saveHistory(meta1, 'url1');
    
    spy.mockReturnValue(now + 1000);
    await historyManager.saveHistory(meta2, 'url2');

    const history = await historyManager.getHistory();
    expect(history[0].title).toBe('Manga 2');
    expect(history[1].title).toBe('Manga 1');

    spy.mockRestore();
  });

  it('should delete specific history', async () => {
    await historyManager.saveHistory({ title: 'M1', tags: [], relatedWorks: [] }, 'url1');
    await historyManager.saveHistory({ title: 'M2', tags: [], relatedWorks: [] }, 'url2');

    await historyManager.deleteHistory('url1');

    const history = await historyManager.getHistory();
    expect(history.length).toBe(1);
    expect(history[0].url).toBe('url2');
  });

  it('should clear all history', async () => {
    await historyManager.saveHistory({ title: 'M1', tags: [], relatedWorks: [] }, 'url1');
    await historyManager.clearHistory();

    const history = await historyManager.getHistory();
    expect(history.length).toBe(0);
  });

  it('should handle large number of records', async () => {
    const count = 100;
    const start = performance.now();
    
    for (let i = 0; i < count; i++) {
      await historyManager.saveHistory({ title: `M${i}`, tags: [], relatedWorks: [] }, `url${i}`);
    }
    
    const history = await historyManager.getHistory();
    const end = performance.now();
    
    expect(history.length).toBe(count);
    console.log(`[Performance] Saving and getting ${count} records took ${end - start}ms`);
  });

  describe('error handling', () => {
    it('should handle save error', async () => {
      const wrapper = (historyManager as unknown as { db: { put: Mock } }).db;
      wrapper.put.mockRejectedValueOnce(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await historyManager.saveHistory({ title: 'T', tags: [], relatedWorks: [] }, 'u');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle get error', async () => {
      const wrapper = (historyManager as unknown as { db: { getAll: Mock } }).db;
      wrapper.getAll.mockRejectedValueOnce(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const history = await historyManager.getHistory();
      expect(history).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle delete error', async () => {
      const wrapper = (historyManager as unknown as { db: { delete: Mock } }).db;
      wrapper.delete.mockRejectedValueOnce(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await historyManager.deleteHistory('u');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle clear error', async () => {
      const wrapper = (historyManager as unknown as { db: { clear: Mock } }).db;
      wrapper.clear.mockRejectedValueOnce(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      await historyManager.clearHistory();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
