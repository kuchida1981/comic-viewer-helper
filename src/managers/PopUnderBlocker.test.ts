// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopUnderBlocker } from './PopUnderBlocker';

describe('PopUnderBlocker', () => {
  /** @type {any} */
  let store: any;
  /** @type {PopUnderBlocker} */
  let blocker: any;

  beforeEach(() => {
    store = {
      getState: vi.fn().mockReturnValue({ enabled: true }),
      setState: vi.fn()
    };
    blocker = new PopUnderBlocker(/** @type {any} */ (store));

    vi.spyOn(document, 'addEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete /** @type {any} */ (window).location;
    Object.defineProperty(window, 'location', {
      value: { href: 'http://localhost/' },
      writable: true,
      configurable: true
    });
  });

  it('init で capture フェーズに click リスナーが登録される', () => {
    blocker.init();
    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
  });

  describe('通常リンクへのクリック', () => {
    /** @type {HTMLAnchorElement} */
    let link: any;

    beforeEach(() => {
      link = document.createElement('a');
      link.href = 'http://example.com/next';
      document.body.appendChild(link);

      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/' },
        writable: true,
        configurable: true
      });
    });

    afterEach(() => {
      link.remove();
    });

    it('インターセプトし、現在のタブで直接遷移する', () => {
      const event = {
        target: link,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('http://example.com/next');
    });
  });

  describe('除外条件', () => {
    /** @type {HTMLAnchorElement} */
    let link: any;

    beforeEach(() => {
      link = document.createElement('a');
      link.href = 'http://example.com/next';
      document.body.appendChild(link);

      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/' },
        writable: true,
        configurable: true
      });
    });

    afterEach(() => {
      link.remove();
    });

    it('サイト側の target="_blank" リンクはインターセプトしない', () => {
      link.target = '_blank';
      const event = {
        target: link,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });

    it('ビューア自身の target="_blank" リンクはインターセプトする', () => {
      link.target = '_blank';
      link.className = 'comic-helper-tag-chip';
      const event = {
        target: link,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('http://example.com/next');
    });

    it('Ctrl キー+クリックはインターセプトしない', () => {
      const event = {
        target: link,
        ctrlKey: true,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });

    it('Meta キー+クリックはインターセプトしない', () => {
      const event = {
        target: link,
        ctrlKey: false,
        metaKey: true,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });

    it('href 属性なしの <a> タグはインターセプトしない', () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('name', 'section');
      document.body.appendChild(link);

      const event = {
        target: anchor,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');

      anchor.remove();
    });

    it('javascript: リンクはインターセプトしない', () => {
      link.href = 'javascript:void(0)';
      const event = {
        target: link,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });
  });

  describe('enabled フラグによる制御', () => {
    /** @type {HTMLAnchorElement} */
    let link: any;

    beforeEach(() => {
      link = document.createElement('a');
      link.href = 'http://example.com/next';
      document.body.appendChild(link);

      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/' },
        writable: true,
        configurable: true
      });
    });

    afterEach(() => {
      link.remove();
    });

    it('enabled が false の場合はインターセプトしない', () => {
      store.getState.mockReturnValue({ enabled: false });
      const event = {
        target: link,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });
  });

  describe('非リンク要素', () => {
    it('<a> 以外の要素クリックは無視する', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);

      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/' },
        writable: true,
        configurable: true
      });

      const event = {
        target: div,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');

      div.remove();
    });

    it('<a> 内の子要素クリックでもインターセプトする', () => {
      const link = document.createElement('a');
      link.href = 'http://example.com/next';
      const span = document.createElement('span');
      link.appendChild(span);
      document.body.appendChild(link);

      Object.defineProperty(window, 'location', {
        value: { href: 'http://localhost/' },
        writable: true,
        configurable: true
      });

      const event = {
        target: span,
        ctrlKey: false,
        metaKey: false,
        stopImmediatePropagation: vi.fn(),
        preventDefault: vi.fn()
      };
      blocker.handleClick(/** @type {any} */ (event));

      expect(event.stopImmediatePropagation).toHaveBeenCalled();
      expect(event.preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('http://example.com/next');

      link.remove();
    });
  });
});
