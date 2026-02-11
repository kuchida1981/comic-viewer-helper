import { Store } from '../store';
import { isResumeDataMap } from '../type-guards';

export interface ResumeData {
  pageIndex: number;
}

export class ResumeManager {
  private store: Store;
  private readonly storageKey = 'comic-viewer-helper-resume-data';

  constructor(store: Store) {
    this.store = store;
  }

  isEnabled = (): boolean => {
    return true;
  };

  savePosition = (url: string, pageIndex: number): void => {
    const data = this._loadData();
    data[url] = { pageIndex };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  };

  loadPosition = (url: string): number | null => {
    const data: Record<string, ResumeData | undefined> = this._loadData();
    const entry = data[url];
    return entry ? entry.pageIndex : null;
  };

  private _loadData = (): Record<string, ResumeData> => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
      return isResumeDataMap(parsed) ? parsed : {};
    } catch {
      return {};
    }
  };

  /**
   * Clear all saved positions
   */
  clearAll = (): void => {
    localStorage.removeItem(this.storageKey);
  };
}
