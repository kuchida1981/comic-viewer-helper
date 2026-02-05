import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PopUnderBlocker } from './PopUnderBlocker.js';
import { createMockMouseEvent, setupLocationMock } from '../test/mocks/dom.js';
import { createMockStore } from '../test/mocks/store.js';
import { StoreState } from '../store.js';

describe('PopUnderBlocker', () => {
  let blocker: PopUnderBlocker;
  let getState: ReturnType<typeof createMockStore>['getState'];

  beforeEach(() => {
    const mock = createMockStore({ enabled: true });
    getState = mock.getState;
    blocker = new PopUnderBlocker(mock.store);

    vi.spyOn(document, 'addEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    setupLocationMock();
  });

  it('init で capture フェーズに click リスナーが登録される', () => {
    blocker.init();
    expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function), true);
  });

  describe('通常リンクへのクリック', () => {
    let link: HTMLAnchorElement;

    beforeEach(() => {
      link = document.createElement('a');
      link.href = 'http://example.com/next';
      document.body.appendChild(link);
      setupLocationMock();
    });

    afterEach(() => {
      link.remove();
    });

    it('インターセプトし、現在のタブで直接遷移する', () => {
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('http://example.com/next');
    });
  });

  describe('除外条件', () => {
    let link: HTMLAnchorElement;

    beforeEach(() => {
      link = document.createElement('a');
      link.href = 'http://example.com/next';
      document.body.appendChild(link);
      setupLocationMock();
    });

    afterEach(() => {
      link.remove();
    });

    it('サイト側の target="_blank" リンクはインターセプトしない', () => {
      link.target = '_blank';
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });

    it('ビューア自身の target="_blank" リンクはインターセプトする', () => {
      link.target = '_blank';
      link.className = 'comic-helper-tag-chip';
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('http://example.com/next');
    });

    it('Ctrl キー+クリックはインターセプトしない', () => {
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link, ctrlKey: true });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });

    it('Meta キー+クリックはインターセプトしない', () => {
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link, metaKey: true });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });

    it('href 属性なしの <a> タグはインターセプトしない', () => {
      const anchor = document.createElement('a');
      anchor.setAttribute('name', 'section');
      document.body.appendChild(anchor);

      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: anchor });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');

      anchor.remove();
    });

    it('javascript: リンクはインターセプトしない', () => {
      link.href = 'javascript:void(0)';
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });
  });

  describe('enabled フラグによる制御', () => {
    let link: HTMLAnchorElement;

    beforeEach(() => {
      link = document.createElement('a');
      link.href = 'http://example.com/next';
      document.body.appendChild(link);
      setupLocationMock();
    });

    afterEach(() => {
      link.remove();
    });

    it('enabled が false の場合はインターセプトしない', () => {
      getState.mockReturnValue({ enabled: false } as unknown as StoreState);
      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: link });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');
    });
  });

  describe('非リンク要素', () => {
    it('<a> 以外の要素クリックは無視する', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      setupLocationMock();

      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: div });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
      expect(window.location.href).toBe('http://localhost/');

      div.remove();
    });

    it('<a> 内の子要素クリックでもインターセプトする', () => {
      const link = document.createElement('a');
      link.href = 'http://example.com/next';
      const span = document.createElement('span');
      link.appendChild(span);
      document.body.appendChild(link);
      setupLocationMock();

      const { event, stopImmediatePropagation, preventDefault } = createMockMouseEvent({ target: span });

      blocker.handleClick(event);

      expect(stopImmediatePropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
      expect(window.location.href).toBe('http://example.com/next');

      link.remove();
    });
  });
});
