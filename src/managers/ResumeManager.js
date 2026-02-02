export class ResumeManager {
  constructor(store) {
    this.store = store;
    this.storageKey = 'comic-viewer-helper-resume-data';
  }

  isEnabled() {
    return this.store.getState().resumeEnabled;
  }

  _loadData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  savePosition(url, pageIndex) {
    if (!this.isEnabled()) return;
    const data = this._loadData();
    data[url] = { pageIndex };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  loadPosition(url) {
    if (!this.isEnabled()) return null;
    const data = this._loadData();
    return data[url]?.pageIndex ?? null;
  }

  clearAll() {
    localStorage.removeItem(this.storageKey);
  }
}
