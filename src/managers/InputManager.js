import { getNavigationDirection } from '../logic.js';
import { SHORTCUTS } from '../shortcuts.js';

export class InputManager {
  /**
   * @param {import('../store.js').Store} store 
   * @param {import('./Navigator.js').Navigator} navigator 
   */
  constructor(store, navigator) {
    this.store = store;
    this.navigator = navigator;
    
    this.lastWheelTime = 0;
    this.WHEEL_THROTTLE_MS = 500;
    this.WHEEL_THRESHOLD = 1;

    /** @type {number | undefined} */
    this.resizeReq = undefined;
    /** @type {number | undefined} */
    this.scrollReq = undefined;

    this.handleWheel = this.handleWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  init() {
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    document.addEventListener('keydown', this.onKeyDown, true);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('scroll', this.handleScroll);
  }

  /**
   * @param {EventTarget | null} target 
   * @returns {boolean}
   */
  isInputField(target) {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      !!target.isContentEditable
    );
  }

  /**
   * @param {WheelEvent} e 
   */
  handleWheel(e) {
    const { enabled, isDualViewEnabled, currentVisibleIndex, isMetadataModalOpen, isHelpModalOpen, isConfigModalOpen } = this.store.getState();
    if (!enabled) return;

    if (isMetadataModalOpen || isHelpModalOpen || isConfigModalOpen) {
      const modalContent = document.querySelector('.comic-helper-modal-content');
      if (modalContent && modalContent.contains(/** @type {Node} */ (e.target))) {
        return;
      }
      e.preventDefault();
      return;
    }

    e.preventDefault();
    const now = Date.now();
    if (now - this.lastWheelTime < this.WHEEL_THROTTLE_MS) return;

    const direction = getNavigationDirection(e, this.WHEEL_THRESHOLD);
    if (direction === 'none') return;

    const imgs = this.navigator.getImages();
    if (imgs.length === 0) return;

    this.lastWheelTime = now;
    const step = isDualViewEnabled ? 2 : 1;
    const nextIndex = direction === 'next' 
      ? Math.min(currentVisibleIndex + step, imgs.length - 1)
      : Math.max(currentVisibleIndex - step, 0);
    
    this.navigator.jumpToPage(nextIndex + 1);
  }

  /**
   * @param {KeyboardEvent} e 
   */
  onKeyDown(e) {
    if (this.isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const { enabled, isDualViewEnabled, isMetadataModalOpen, isHelpModalOpen, isConfigModalOpen } = this.store.getState();

    // Handle Escape for all modals
    if (e.key === 'Escape') {
      if (isMetadataModalOpen || isHelpModalOpen || isConfigModalOpen) {
        e.preventDefault();
        this.store.setState({ isMetadataModalOpen: false, isHelpModalOpen: false, isConfigModalOpen: false });
        return;
      }
    }

    // Helper function to check if a key matches a shortcut
    /** @param {string} id */
    const isKey = (id) => {
      const sc = SHORTCUTS.find(s => s.id === id);
      if (!sc) return false;
      return sc.keys.some(k => {
        if (k.startsWith('Shift+')) {
          const baseKey = k.replace('Shift+', '');
          return e.shiftKey && e.key === (baseKey === 'Space' ? ' ' : baseKey);
        }
        return !e.shiftKey && e.key === (k === 'Space' ? ' ' : k);
      });
    };

    // Allow toggling help even if already open
    if (isKey('help') && isHelpModalOpen) {
      e.preventDefault();
      this.store.setState({ isHelpModalOpen: false });
      return;
    }

    // Allow toggling config even if already open
    if (isKey('config') && isConfigModalOpen) {
      e.preventDefault();
      this.store.setState({ isConfigModalOpen: false });
      return;
    }

    if (isMetadataModalOpen || isHelpModalOpen || isConfigModalOpen || !enabled) return;

    if (isKey('nextPage')) {
      e.preventDefault();
      this.navigator.scrollToImage(1);
    } else if (isKey('prevPage')) {
      e.preventDefault();
      this.navigator.scrollToImage(-1);
    } else if (isKey('dualView')) {
      e.preventDefault();
      this.store.setState({ isDualViewEnabled: !isDualViewEnabled });
    } else if (isKey('spreadOffset') && isDualViewEnabled) {
      e.preventDefault();
      const { spreadOffset } = this.store.getState();
      this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
    } else if (isKey('metadata')) {
      e.preventDefault();
      this.store.setState({ isMetadataModalOpen: !isMetadataModalOpen });
    } else if (isKey('help')) {
      e.preventDefault();
      this.store.setState({ isHelpModalOpen: !isHelpModalOpen });
    } else if (isKey('config')) {
      e.preventDefault();
      this.store.setState({ isConfigModalOpen: !isConfigModalOpen });
    }
  }

  handleResize() {
    const { enabled, currentVisibleIndex } = this.store.getState();
    if (!enabled) return;
    
    if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
    this.resizeReq = requestAnimationFrame(() => this.navigator.applyLayout(currentVisibleIndex));
  }

  handleScroll() {
    if (!this.store.getState().enabled) return;
    
    if (this.scrollReq) cancelAnimationFrame(this.scrollReq);
    this.scrollReq = requestAnimationFrame(() => this.navigator.updatePageCounter());
  }
}
