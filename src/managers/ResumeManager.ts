import { Store } from '../store';
import { isResumeDataMap } from '../type-guards';

export interface ResumeData {
  pageIndex: number;
}

export class ResumeManager {
  private store: Store;
  private readonly storageKeyBase = 'comic-viewer-helper-resume-data';

  constructor(store: Store) {
    this.store = store;
  }

  private get storageKey(): string {
    return `${this.storageKeyBase}-${window.location.hostname}`;
  }

  isEnabled = (): boolean => {
    return true;
  };

  savePosition = (url: string, pageIndex: number): void => {
    const data = this._loadData();
    data[url] = { pageIndex };
    GM_setValue(this.storageKey, JSON.stringify(data));
  };

  loadPosition = (url: string): number | null => {
    const data: Record<string, ResumeData | undefined> = this._loadData();
    const entry = data[url];
    return entry ? entry.pageIndex : null;
  };

  private _loadData = (): Record<string, ResumeData> => {
    try {
      const parsed: unknown = JSON.parse(GM_getValue(this.storageKey) || '{}');
      return isResumeDataMap(parsed) ? parsed : {};
    } catch {
      return {};
    }
  };

  /**
   * Clear all saved positions
   */
  clearAll = (): void => {
    GM_deleteValue(this.storageKey);
  };
}
