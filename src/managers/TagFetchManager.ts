import { Store } from '../store';
import { RelatedWork, Tag } from '../types';

const FETCH_DELAY_MS = 500;

export class TagFetchManager {
  private store: Store;
  private parseTagsFromDoc: (doc: Document) => Tag[];
  private queue: string[];
  private inFlight: Set<string>;
  private isRunning: boolean;

  constructor(store: Store, parseTagsFromDoc: (doc: Document) => Tag[]) {
    this.store = store;
    this.parseTagsFromDoc = parseTagsFromDoc;
    this.queue = [];
    this.inFlight = new Set();
    this.isRunning = false;
  }

  /**
   * Enqueue works whose tags are not yet in the cache.
   * Already-queued, in-flight, or cached URLs are skipped (deduplication).
   */
  start(works: RelatedWork[]): void {
    const cache = this.store.getState().workTagsCache;
    const inQueue = new Set(this.queue);
    for (const work of works) {
      if (work.href in cache) continue;
      if (inQueue.has(work.href)) continue;
      if (this.inFlight.has(work.href)) continue;
      this.queue.push(work.href);
    }
    if (!this.isRunning) {
      void this._processQueue();
    }
  }

  /**
   * Clear the pending queue. In-flight fetch will still complete.
   */
  stop(): void {
    this.queue = [];
  }

  private async _processQueue(): Promise<void> {
    this.isRunning = true;
    while (this.queue.length > 0) {
      const url = this.queue.shift()!;
      this.inFlight.add(url);
      try {
        const tags = await this._fetchTags(url);
        const current = this.store.getState().workTagsCache;
        this.store.setState({ workTagsCache: { ...current, [url]: tags } });
      } catch {
        // Silently ignore fetch errors to avoid blocking the queue
      }
      this.inFlight.delete(url);
      if (this.queue.length > 0) {
        await this._delay(FETCH_DELAY_MS);
      }
    }
    this.isRunning = false;
  }

  private async _fetchTags(url: string): Promise<Tag[]> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return this.parseTagsFromDoc(doc);
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
