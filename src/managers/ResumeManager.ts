import { Store } from '../store';

interface ResumeData {
  pageIndex: number;
}

export class ResumeManager {
  private store: Store;
  private readonly storageKey = 'comic-viewer-helper-resume-data';

  constructor(store: Store) {
    this.store = store;
  }

  isEnabled(): boolean {
    return true;
  }

  savePosition(url: string, pageIndex: number): void {
    const data = this._loadData();
    data[url] = { pageIndex };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  loadPosition(url: string): number | null {
    const data = this._loadData();
    return data[url]?.pageIndex ?? null;
  }

  private _loadData(): Record<string, ResumeData> {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Clear all saved positions
   */
  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }
}
