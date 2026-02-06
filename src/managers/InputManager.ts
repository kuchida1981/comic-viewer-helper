import { getNavigationDirection, getClickNavigationDirection, jumpToRandomWork } from '../logic';
import { SHORTCUTS } from '../shortcuts';
import { Store } from '../store';
import { Navigator } from './Navigator';

const CLICK_THRESHOLD_PX = 5;

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

    this.resizeReq = undefined;
    this.scrollReq = undefined;

    this.mouseDownPos = null;
    this.mouseDownTarget = null;

    this.handleWheel = this.handleWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  init(): void {
    window.addEventListener('wheel', this.handleWheel, { passive: false });
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    window.addEventListener('scroll', this.handleScroll);
  }

  isInputField(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      !!target.isContentEditable
    );
  }

  handleWheel(e: WheelEvent): void {
    const { enabled, isDualViewEnabled, currentVisibleIndex, isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen } = this.store.getState();
    if (!enabled) return;

    if (isMetadataModalOpen || isHelpModalOpen || isSearchModalOpen) {
      const modalContent = document.querySelector('.comic-helper-modal-content');
      if (modalContent && modalContent.contains(e.target as Node)) {
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

    if (direction === 'next' && currentVisibleIndex + step >= imgs.length) {
      if (!isMetadataModalOpen) {
        this.store.setState({ isMetadataModalOpen: true });
      }
      return;
    }

    const nextIndex = direction === 'next'
      ? currentVisibleIndex + step
      : Math.max(currentVisibleIndex - step, 0);

    this.navigator.jumpToPage(nextIndex + 1);
  }

  onKeyDown(e: KeyboardEvent): void {
    if (this.isInputField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const { enabled, isDualViewEnabled, isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen } = this.store.getState();

    // Handle Escape for all modals
    if (e.key === 'Escape') {
      if (isMetadataModalOpen || isHelpModalOpen || isSearchModalOpen) {
        e.preventDefault();
        this.store.setState({
          isMetadataModalOpen: false,
          isHelpModalOpen: false,
          isSearchModalOpen: false
        });
        return;
      }
    }

    // Helper function to check if a key matches a shortcut
    const isKey = (id: string) => {
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

    if (isKey('search')) {
      e.preventDefault();
      this.store.setState({ isSearchModalOpen: !isSearchModalOpen });
      return;
    }

    if (isMetadataModalOpen || isHelpModalOpen || isSearchModalOpen || !enabled) return;

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
    } else if (isKey('fullscreen')) {
      e.preventDefault();
      if (!document.documentElement.requestFullscreen) return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else if (isKey('randomJump')) {
      e.preventDefault();
      const { metadata } = this.store.getState();
      jumpToRandomWork(metadata);
    }
  }

  handleResize(): void {
    const { enabled, currentVisibleIndex } = this.store.getState();
    if (!enabled) return;

    if (this.resizeReq) cancelAnimationFrame(this.resizeReq);
    this.resizeReq = requestAnimationFrame(() => this.navigator.applyLayout(currentVisibleIndex));
  }

  handleFullscreenChange(): void {
    const { enabled, currentVisibleIndex } = this.store.getState();
    if (!enabled) return;

    // Wait for the fullscreen transition to complete and layout to stabilize
    setTimeout(() => {
      this.navigator.applyLayout(currentVisibleIndex);
    }, 100);
  }

  handleScroll(): void {
    if (!this.store.getState().enabled) return;

    if (this.scrollReq) cancelAnimationFrame(this.scrollReq);
    this.scrollReq = requestAnimationFrame(() => this.navigator.updatePageCounter());
  }

  onMouseDown(e: MouseEvent): void {
    if (!(e.target instanceof HTMLImageElement)) return;
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
    this.mouseDownTarget = e.target;
  }

  onMouseUp(e: MouseEvent): void {
    const target = this.mouseDownTarget;
    const startPos = this.mouseDownPos;
    this.mouseDownTarget = null;
    this.mouseDownPos = null;

    if (!target || !startPos) return;
    if (!(e.target instanceof HTMLImageElement) || e.target !== target) return;

    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    if (Math.sqrt(dx * dx + dy * dy) >= CLICK_THRESHOLD_PX) return;

    const { enabled, isMetadataModalOpen, isHelpModalOpen, isSearchModalOpen } = this.store.getState();
    if (!enabled || isMetadataModalOpen || isHelpModalOpen || isSearchModalOpen) return;

    const direction = getClickNavigationDirection(target);
    this.navigator.scrollToImage(direction === 'next' ? 1 : -1);
  }
}
