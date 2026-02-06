import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchModal } from './SearchModal';
import { t } from '../../i18n';
import { SearchResultsState } from '../../types';

const defaultProps = { 
  onSearch: () => {}, 
  onPageChange: () => {}, 
  onClose: () => {}, 
  searchResults: null,
  searchHistory: []
};

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

  it('should call onSearch and stop propagation when submitting the form', () => {
    const onSearch = vi.fn();
    const { el, input } = createSearchModal({ ...defaultProps, onSearch });
    input.value = 'test query';
    const form = el.querySelector('form') as HTMLFormElement;
    const event = new Event('submit', { cancelable: true, bubbles: true });
    const stopSpy = vi.spyOn(event, 'stopPropagation');
    form.dispatchEvent(event);
    expect(onSearch).toHaveBeenCalledWith('test query');
    expect(stopSpy).toHaveBeenCalled();
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

  

      it('should render search history chips when provided', () => {

        const history = ['query 1', 'query 2'];

        const { el } = createSearchModal({ ...defaultProps, searchHistory: history });

        

        const chips = el.querySelectorAll('.comic-helper-search-history-item');

        expect(chips).toHaveLength(2);

        expect(chips[0].textContent).toBe('query 1');

        expect(chips[1].textContent).toBe('query 2');

      });

  

      it('should call onSearch when a history chip is clicked', () => {

        const onSearch = vi.fn();

        const history = ['history query'];

        const { el, input } = createSearchModal({ ...defaultProps, onSearch, searchHistory: history });

        

        const chip = el.querySelector('.comic-helper-search-history-item') as HTMLButtonElement;

        chip.click();

        

        expect(input.value).toBe('history query');

        expect(onSearch).toHaveBeenCalledWith('history query');

      });

  

      describe('search results display', () => {

  
    const sampleResults: SearchResultsState = {
      results: [
        { title: 'Work A', href: '/fanzine/1/', thumb: '/thumb/1.webp' },
        { title: 'Work B', href: '/fanzine/2/', thumb: '/thumb/2.webp' }
      ],
      totalCount: '100件',
      nextPageUrl: '/page/2/?s=kw',
      pagination: [
        { label: '1', url: null, isCurrent: true, type: 'page' },
        { label: '2', url: '/page/2/?s=kw', isCurrent: false, type: 'page' },
        { label: '›', url: '/page/2/?s=kw', isCurrent: false, type: 'next' }
      ]
    };

    it('should not render results section content when searchResults is null', () => {
      const { el } = createSearchModal(defaultProps);
      expect(el.querySelector('.comic-helper-search-result-grid')).toBeNull();
      expect(el.querySelector('.comic-helper-search-pagination')).toBeNull();
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

    it('should render pagination buttons when pagination data exists', () => {
      const { el } = createSearchModal({ ...defaultProps, searchResults: sampleResults });
      const pagination = el.querySelector('.comic-helper-search-pagination');
      expect(pagination).not.toBeNull();
      const buttons = pagination!.querySelectorAll('.comic-helper-search-page-btn');
      expect(buttons).toHaveLength(3);
      expect(buttons[0].textContent).toBe('1');
      expect(buttons[0].classList.contains('active')).toBe(true);
      expect(buttons[1].textContent).toBe('2');
      expect(buttons[2].textContent).toBe('›');
    });

    it('should call onPageChange and stop propagation when clicking a pagination button', () => {
      const onPageChange = vi.fn();
      const { el } = createSearchModal({ ...defaultProps, onPageChange, searchResults: sampleResults });
      const btn2 = el.querySelectorAll('.comic-helper-search-page-btn')[1] as HTMLButtonElement;
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopSpy = vi.spyOn(event, 'stopPropagation');
      btn2.dispatchEvent(event);
      expect(onPageChange).toHaveBeenCalledWith('/page/2/?s=kw');
      expect(stopSpy).toHaveBeenCalled();
    });

    it('should not render pagination when pagination data is empty', () => {
      const resultsNoPage: SearchResultsState = { ...sampleResults, pagination: [] };
      const { el } = createSearchModal({ ...defaultProps, searchResults: resultsNoPage });
      expect(el.querySelector('.comic-helper-search-pagination')).toBeNull();
    });

    it('should show no-results message when results array is empty', () => {
      const emptyResults: SearchResultsState = { results: [], totalCount: '0件', nextPageUrl: null, pagination: [] };
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

    it('should stop click propagation on pagination buttons', () => {
      const onClose = vi.fn();
      const { el } = createSearchModal({ ...defaultProps, onClose, searchResults: sampleResults });
      const btn = el.querySelector('.comic-helper-search-page-btn') as HTMLElement;
      btn.click();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should replace previous results when updateResults() is called again', () => {
      const { el, updateResults } = createSearchModal({ ...defaultProps, searchResults: sampleResults });
      expect(el.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);

      const newResults: SearchResultsState = {
        results: [{ title: 'Work C', href: '/fanzine/3/', thumb: '/thumb/3.webp' }],
        totalCount: '1件',
        nextPageUrl: null,
        pagination: []
      };
      updateResults(newResults);
      expect(el.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(1);
      expect(el.querySelector('.comic-helper-search-pagination')).toBeNull();
    });
  });

  describe('updating state', () => {
    it('should show loading indicators and disable inputs when setUpdating(true) after delay', () => {
      const { el, input, setUpdating } = createSearchModal(defaultProps);
      const submitBtn = el.querySelector('.comic-helper-search-submit') as HTMLButtonElement;
      const overlay = el.querySelector('.comic-helper-search-spinner-overlay') as HTMLElement;
      const updatingText = el.querySelector('.comic-helper-search-updating') as HTMLElement;

      setUpdating(true);

      // Should be immediate for indicator and disabled state
      expect(updatingText.style.display).toBe('inline');
      expect(input.disabled).toBe(true);
      expect(submitBtn.disabled).toBe(true);
      
      // Spinner overlay should be delayed (200ms)
      expect(overlay.classList.contains('visible')).toBe(false);
      vi.advanceTimersByTime(200);
      expect(overlay.classList.contains('visible')).toBe(true);
    });

    it('should hide loading indicators and enable inputs when setUpdating(false) after minimum time', () => {
      const { el, input, setUpdating } = createSearchModal(defaultProps);
      const submitBtn = el.querySelector('.comic-helper-search-submit') as HTMLButtonElement;
      const overlay = el.querySelector('.comic-helper-search-spinner-overlay') as HTMLElement;

      setUpdating(true);
      vi.advanceTimersByTime(200); // Show it
      expect(overlay.classList.contains('visible')).toBe(true);

      setUpdating(false);

      // Should still be visible due to minimum display time (400ms)
      expect(overlay.classList.contains('visible')).toBe(true);
      expect(input.disabled).toBe(true);

      vi.advanceTimersByTime(400);
      expect(overlay.classList.contains('visible')).toBe(false);
      expect(input.disabled).toBe(false);
      expect(submitBtn.disabled).toBe(false);
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
