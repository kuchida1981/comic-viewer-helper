import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchModal } from './SearchModal';
import { t } from '../../i18n';
import { SearchResultsState } from '../../types';

const defaultProps = { onSearch: () => {}, onClose: () => {}, searchResults: null };

describe('SearchModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render title and input', () => {
    const { el } = createSearchModal(defaultProps);
    expect(el.textContent).toContain(t('ui.search'));
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toContain(t('ui.searchPlaceholder'));
  });

  it('should call onSearch when submitting the form', () => {
    const onSearch = vi.fn();
    const { el, input } = createSearchModal({ ...defaultProps, onSearch });
    input.value = 'test query';
    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should not call onSearch if query is empty', () => {
    const onSearch = vi.fn();
    const { el, input } = createSearchModal({ ...defaultProps, onSearch });
    input.value = '   ';
    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ ...defaultProps, onClose });
    el.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ ...defaultProps, onClose });
    const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should stop propagation when clicking content', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ ...defaultProps, onClose });
    const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
    content.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should focus input after a delay', () => {
    const { input } = createSearchModal(defaultProps);
    const focusSpy = vi.spyOn(input, 'focus');
    vi.advanceTimersByTime(50);
    expect(focusSpy).toHaveBeenCalled();
  });

  describe('search results display', () => {
    const sampleResults: SearchResultsState = {
      results: [
        { title: 'Work A', href: '/fanzine/1/', thumb: '/thumb/1.webp' },
        { title: 'Work B', href: '/fanzine/2/', thumb: '/thumb/2.webp' }
      ],
      totalCount: '100件',
      nextPageUrl: '/page/2/?s=kw'
    };

    it('should not render results section content when searchResults is null', () => {
      const { el } = createSearchModal(defaultProps);
      expect(el.querySelector('.comic-helper-search-result-grid')).toBeNull();
      expect(el.querySelector('.comic-helper-search-more-link')).toBeNull();
    });

    it('should render results grid when searchResults is provided at creation', () => {
      const { el } = createSearchModal({ ...defaultProps, searchResults: sampleResults });
      const grid = el.querySelector('.comic-helper-search-result-grid');
      expect(grid).not.toBeNull();
      expect(grid!.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);
    });

    it('should display totalCount in section header', () => {
      const { el } = createSearchModal({ ...defaultProps, searchResults: sampleResults });
      const header = el.querySelector('.comic-helper-section-title');
      expect(header?.textContent).toContain('100件');
    });

    it('should render "もっと見る" link when nextPageUrl exists', () => {
      const { el } = createSearchModal({ ...defaultProps, searchResults: sampleResults });
      const moreLink = el.querySelector('.comic-helper-search-more-link') as HTMLAnchorElement;
      expect(moreLink).not.toBeNull();
      expect(moreLink.getAttribute('href')).toBe('/page/2/?s=kw');
    });

    it('should not render "もっと見る" link when nextPageUrl is null', () => {
      const resultsNoNext: SearchResultsState = { ...sampleResults, nextPageUrl: null };
      const { el } = createSearchModal({ ...defaultProps, searchResults: resultsNoNext });
      expect(el.querySelector('.comic-helper-search-more-link')).toBeNull();
    });

    it('should show no-results message when results array is empty', () => {
      const emptyResults: SearchResultsState = { results: [], totalCount: '0件', nextPageUrl: null };
      const { el } = createSearchModal({ ...defaultProps, searchResults: emptyResults });
      const msg = el.querySelector('.comic-helper-search-no-results');
      expect(msg).not.toBeNull();
      expect(msg?.textContent).toBe(t('ui.searchNoResults'));
      expect(el.querySelector('.comic-helper-search-result-grid')).toBeNull();
    });

    it('should update results via updateResults()', () => {
      const { el, updateResults } = createSearchModal(defaultProps);
      expect(el.querySelector('.comic-helper-search-result-grid')).toBeNull();

      updateResults(sampleResults);
      const grid = el.querySelector('.comic-helper-search-result-grid');
      expect(grid).not.toBeNull();
      expect(grid!.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);
    });

    it('should stop click propagation on result items', () => {
      const onClose = vi.fn();
      const { el } = createSearchModal({ ...defaultProps, onClose, searchResults: sampleResults });
      const item = el.querySelector('.comic-helper-search-result-item') as HTMLElement;
      item.click();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should stop click propagation on もっと見る link', () => {
      const onClose = vi.fn();
      const { el } = createSearchModal({ ...defaultProps, onClose, searchResults: sampleResults });
      const moreLink = el.querySelector('.comic-helper-search-more-link') as HTMLElement;
      moreLink.click();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should replace previous results when updateResults() is called again', () => {
      const { el, updateResults } = createSearchModal({ ...defaultProps, searchResults: sampleResults });
      expect(el.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);

      const newResults: SearchResultsState = {
        results: [{ title: 'Work C', href: '/fanzine/3/', thumb: '/thumb/3.webp' }],
        totalCount: '1件',
        nextPageUrl: null
      };
      updateResults(newResults);
      expect(el.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(1);
      expect(el.querySelector('.comic-helper-search-more-link')).toBeNull();
    });
  });

  describe('scroll isolation', () => {
    it('should prevent wheel event on overlay from propagating', () => {
      const { el } = createSearchModal(defaultProps);
      const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
      const propagateSpy = vi.spyOn(wheelEvent, 'stopPropagation');
      el.dispatchEvent(wheelEvent);
      expect(propagateSpy).toHaveBeenCalled();
      expect(wheelEvent.defaultPrevented).toBe(true);
    });

    it('should stop wheel propagation on content but allow default scroll', () => {
      const { el } = createSearchModal(defaultProps);
      const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
      const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
      const propagateSpy = vi.spyOn(wheelEvent, 'stopPropagation');
      content.dispatchEvent(wheelEvent);
      expect(propagateSpy).toHaveBeenCalled();
      expect(wheelEvent.defaultPrevented).toBe(false);
    });
  });
});
