import { IndexedDBWrapper } from '../utils/indexedDB';
import { Metadata, Tag } from '../types';

export interface HistoryRecord {
  url: string;
  title: string;
  thumb: string;
  tags: Tag[];
  lastViewedAt: number;
}

const DB_CONFIG = {
  name: 'comic-viewer-helper-db',
  version: 1,
  stores: {
    history: {
      keyPath: 'url',
      indexes: {
        lastViewedAt: 'lastViewedAt'
      }
    }
  }
};

export class HistoryManager {
  private db: IndexedDBWrapper;

  constructor() {
    this.db = new IndexedDBWrapper(DB_CONFIG);
  }

  async saveHistory(metadata: Metadata, url: string): Promise<void> {
    const thumb = metadata.relatedWorks?.[0]?.thumb || ''; // Fallback thumb
    const record: HistoryRecord = {
      url,
      title: metadata.title,
      thumb,
      tags: metadata.tags,
      lastViewedAt: Date.now()
    };

    try {
      await this.db.put('history', record);
      console.log(`[HistoryManager] Saved history for: ${metadata.title}`);
    } catch (e) {
      console.error('[HistoryManager] Failed to save history:', e);
    }
  }

  async getHistory(): Promise<HistoryRecord[]> {
    try {
      const all = await this.db.getAll<HistoryRecord>('history');
      // Sort by lastViewedAt descending
      return all.sort((a, b) => b.lastViewedAt - a.lastViewedAt);
    } catch (e) {
      console.error('[HistoryManager] Failed to get history:', e);
      return [];
    }
  }

  async deleteHistory(url: string): Promise<void> {
    try {
      await this.db.delete('history', url);
    } catch (e) {
      console.error('[HistoryManager] Failed to delete history:', e);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await this.db.clear('history');
    } catch (e) {
      console.error('[HistoryManager] Failed to clear history:', e);
    }
  }
}
