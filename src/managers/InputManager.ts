import { getNavigationDirection, getClickNavigationDirection, jumpToRandomWork } from '../logic';
import { SHORTCUTS } from '../shortcuts';
import { Store } from '../store';
import { Navigator } from './Navigator';

const CLICK_THRESHOLD_PX = 5;

/**
 * Check if a keyboard event matches a given shortcut ID
 */
function matchesShortcut(e: KeyboardEvent, id: string): boolean {
  const sc = SHORTCUTS.find(s => s.id === id);
  if (!sc) return false;
  return sc.keys.some(k => {
    if (k.startsWith('Shift+')) {
      const baseKey = k.replace('Shift+', '');
      return e.shiftKey && e.key === (baseKey === 'Space' ? ' ' : baseKey);
    }
    // If it's a direct key match (like '?'), allow it regardless of Shift state
    // because Shift+'/' becomes '?' in event.key.
    return e.key === (k === 'Space' ? ' ' : k);
  });
}

export class InputManager {
  private store: Store;
  private navigator: Navigator;
  private lastWheelTime: number;
  private readonly WHEEL_THROTTLE_MS = 500;
  private readonly WHEEL_THRESHOLD = 1;
  private resizeReq?: number;
  private scrollReq?: number;
  private mouseDownPos: { x: number; y: number } | null;
  private mouseDownTarget: HTMLImageElement | null;

  constructor(store: Store, navigator: Navigator) {
    this.store = store;
    this.navigator = navigator;
    this.lastWheelTime = 0;
    this.mouseDownPos = null;
    this.mouseDownTarget = null;
  }

  init = (): void => {
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('scroll', this.handleScroll);
  };

  isInputField = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      !!target.isContentEditable
    );
  };

  private _isAnyModalOpen = (): boolean => {
    const { isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen } = this.store.getState();
    return isMetadataModalOpen || isHelpModalOpen || isSearchModalOpen;
  };

  handleWheel = (e: WheelEvent): void => {
    const state = this.store.getState();
    if (!state.enabled) return;

    if (this._isAnyModalOpen()) {
      const modalContent = document.querySelector('.comic-helper-modal-content');
      if (!modalContent || !modalContent.contains(e.target as Node)) {
        e.preventDefault();
      }
      return;
    }

    e.preventDefault();
    const now = Date.now();
    if (now - this.lastWheelTime < this.WHEEL_THROTTLE_MS) return;

    const direction = getNavigationDirection(e, this.WHEEL_THRESHOLD);
    if (direction === 'none') return;

    this.lastWheelTime = now;
    this._navigateByWheel(direction);
  };

  private _navigateByWheel = (direction: 'next' | 'prev'): void => {
    const { isDualViewEnabled, currentVisibleIndex, isMetadataModalOpen } = this.store.getState();
    const imgs = this.navigator.getImages();
    if (imgs.length === 0) return;

    const step = isDualViewEnabled ? 2 : 1;

    if (direction === 'next' && currentVisibleIndex + step >= imgs.length) {
      if (!isMetadataModalOpen) {
        this.store.setState({ isMetadataModalOpen: true });
      }
      return;
    }

    const nextIndex = direction === 'next'
      ? currentVisibleIndex + step
      : Math.max(currentVisibleIndex - step, 0);

    void this.navigator.jumpToPage(nextIndex + 1);
  };

  onKeyDown = (e: KeyboardEvent): void => {
    if (this.isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;

    if (this._handleModalCloseShortcuts(e)) return;
    if (this._handleToggleShortcuts(e)) return;

    if (!this.store.getState().enabled || this._isAnyModalOpen()) return;

    this._handleShortcutAction(e);
  };

  private _handleModalCloseShortcuts = (e: KeyboardEvent): boolean => {
    if (e.key === 'Escape' && this._isAnyModalOpen()) {
      e.preventDefault();
      this.store.setState({ isMetadataModalOpen: false, isHelpModalOpen: false, isSearchModalOpen: false });
      return true;
    }
    return false;
  };

  private _handleToggleShortcuts = (e: KeyboardEvent): boolean => {
    if (matchesShortcut(e, 'help')) {
      e.preventDefault();
      this.store.setState({ isHelpModalOpen: !this.store.getState().isHelpModalOpen });
      return true;
    }
    if (matchesShortcut(e, 'search')) {
      e.preventDefault();
      this.store.setState({ isSearchModalOpen: !this.store.getState().isSearchModalOpen });
      return true;
    }
    return false;
  };

  private _handleShortcutAction = (e: KeyboardEvent): void => {
    const { isDualViewEnabled, isMetadataModalOpen, isHelpModalOpen, spreadOffset, metadata, searchCache } = this.store.getState();

    const actions: Record<string, () => void | Promise<void>> = {
      nextPage: () => this.navigator.scrollToImage(1),
      prevPage: () => this.navigator.scrollToImage(-1),
      dualView: () => this.store.setState({ isDualViewEnabled: !isDualViewEnabled }),
      spreadOffset: () => { if (isDualViewEnabled) this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 }); },
      metadata: () => this.store.setState({ isMetadataModalOpen: !isMetadataModalOpen }),
      help: () => this.store.setState({ isHelpModalOpen: !isHelpModalOpen }),
      fullscreen: () => this._toggleFullscreen(),
      randomJump: () => { jumpToRandomWork(metadata, searchCache); }
    };

    for (const [id, action] of Object.entries(actions)) {
      if (matchesShortcut(e, id)) {
        e.preventDefault();
        const result = action();
        if (result instanceof Promise) {
          void result.catch((err: unknown) => { console.error('Shortcut action failed:', err); });
        }
        break;
      }
    }
  };

  private _toggleFullscreen = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!document.documentElement.requestFullscreen) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else {
      document.documentElement.requestFullscreen().catch(() => { });
    }
  };

  handleResize = (): void => {
    const { enabled, currentVisibleIndex } = this.store.getState();
    if (!enabled) return;

    if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
    this.resizeReq = requestAnimationFrame(() => this.navigator.applyLayout(currentVisibleIndex));
  };

  handleFullscreenChange = (): void => {
    const { enabled, currentVisibleIndex } = this.store.getState();
    if (!enabled) return;

    requestAnimationFrame(() => {
      this.navigator.applyLayout(currentVisibleIndex);
    });
  };

  handleScroll = (): void => {
    if (!this.store.getState().enabled) return;

    if (this.scrollReq) cancelAnimationFrame(this.scrollReq);
    this.scrollReq = requestAnimationFrame(() => this.navigator.updatePageCounter());
  };

  onMouseDown = (e: MouseEvent): void => {
    if (!(e.target instanceof HTMLImageElement)) return;
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
    this.mouseDownTarget = e.target;
  };

  onMouseUp = (e: MouseEvent): void => {
    const target = this.mouseDownTarget;
    const startPos = this.mouseDownPos;
    this.mouseDownTarget = null;
    this.mouseDownPos = null;

    if (!target || !startPos || !(e.target instanceof HTMLImageElement) || e.target !== target) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    if (Math.sqrt(dx * dx + dy * dy) >= CLICK_THRESHOLD_PX) return;

    if (!this.store.getState().enabled || this._isAnyModalOpen()) return;

    const direction = getClickNavigationDirection(target);
    void this.navigator.scrollToImage(direction === 'next' ? 1 : -1);
  };
}
