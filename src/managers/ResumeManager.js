export class ResumeManager {
  /**
   * @param {import('../store.js').Store} store 
   */
  constructor(store) {
    this.store = store;
    this.storageKey = 'comic-viewer-helper-resume-data';
  }

  /**
   * @returns {boolean}
   */
  isEnabled() {
    return true;
  }

  /**
   * @param {string} url 
   * @param {number} pageIndex 
   */
  savePosition(url, pageIndex) {
    const data = this._loadData();
    data[url] = { pageIndex };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * @param {string} url 
   * @returns {number|null}
   */
  loadPosition(url) {
    const data = this._loadData();
    return data[url]?.pageIndex ?? null;
  }

  /**
   * @returns {Object.<string, any>}
   */
  _loadData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch {
      return {};
    }
  }

  /**
   * Clear all saved positions
   */
  clearAll() {
    localStorage.removeItem(this.storageKey);
  }
}
