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

  it('should show searchQuery in input only if context is keyword', () => {
    // 1. Keyword context
    const { input: input1 } = createSearchModal({ 
      ...defaultProps, 
      searchQuery: 'my keyword',
      searchContext: { type: 'keyword', label: 'my keyword' }
    });
    expect(input1.value).toBe('my keyword');

    // 2. Tag context
    const { input: input2 } = createSearchModal({ 
      ...defaultProps, 
      searchQuery: 'my keyword',
      searchContext: { type: 'tag', label: 'SomeTag' }
    });
    expect(input2.value).toBe('');

    // 3. No context (should default to empty if context.type is not keyword)
    const { input: input3 } = createSearchModal({ 
      ...defaultProps, 
      searchQuery: 'my keyword'
    });
    expect(input3.value).toBe('');
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

    it('should display search context in header if provided', () => {
      const resultsWithContext: SearchResultsState = {
        ...sampleResults,
        searchContext: { type: 'tag', label: 'CoolTag' }
      };
      const { el } = createSearchModal({ ...defaultProps, searchResults: resultsWithContext });
      const header = el.querySelector('.comic-helper-section-title');
      expect(header?.textContent).toContain('Tag: CoolTag');
      expect(header?.textContent).toContain('(100件)');
    });

    it('should display genre context in header if provided', () => {
      const resultsWithContext: SearchResultsState = {
        ...sampleResults,
        searchContext: { type: 'genre', label: 'Action' }
      };
      const { el } = createSearchModal({ ...defaultProps, searchResults: resultsWithContext });
      const header = el.querySelector('.comic-helper-section-title');
      expect(header?.textContent).toContain('Genre: Action');
    });

    it('should complete input value and focus when header tag name is clicked', () => {
      const resultsWithContext: SearchResultsState = {
        ...sampleResults,
        searchContext: { type: 'tag', label: 'CoolTag' }
      };
      const { el, input } = createSearchModal({ ...defaultProps, searchResults: resultsWithContext });
      input.value = 'some keyword';

      const tagEl = el.querySelector('.comic-helper-search-header-tag') as HTMLElement;
      expect(tagEl).not.toBeNull();
      expect(tagEl.textContent).toBe('CoolTag');

      const focusSpy = vi.spyOn(input, 'focus');
      tagEl.click();

      expect(input.value).toBe('CoolTag ');
      expect(focusSpy).toHaveBeenCalled();
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

    it('should show no-results message when results array is empty', () => {
      const emptyResults: SearchResultsState = { results: [], totalCount: '0件', nextPageUrl: null, pagination: [] };
      const { el } = createSearchModal({ ...defaultProps, searchResults: emptyResults });
      const msg = el.querySelector('.comic-helper-search-no-results');
      expect(msg).not.toBeNull();
      expect(msg?.textContent).toBe(t('ui.searchNoResults'));
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
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      const stopSpy = vi.spyOn(event, 'stopPropagation');
      item.dispatchEvent(event);
      expect(onClose).not.toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('updating state', () => {
    it('should show loading indicators and disable inputs when setUpdating(true) after delay', () => {
      const { el, input, setUpdating } = createSearchModal(defaultProps);
      const submitBtn = el.querySelector('.comic-helper-search-submit') as HTMLButtonElement;
      const overlay = el.querySelector('.comic-helper-search-spinner-overlay') as HTMLElement;
      const updatingText = el.querySelector('.comic-helper-search-updating') as HTMLElement;

      setUpdating(true);
      expect(updatingText.style.display).toBe('inline');
      expect(input.disabled).toBe(true);
      expect(submitBtn.disabled).toBe(true);
      
      expect(overlay.classList.contains('visible')).toBe(false);
      vi.advanceTimersByTime(200);
      expect(overlay.classList.contains('visible')).toBe(true);
    });

    it('should hide loading indicators and enable inputs when setUpdating(false) after minimum time', () => {
      const { el, input, setUpdating } = createSearchModal(defaultProps);
      const submitBtn = el.querySelector('.comic-helper-search-submit') as HTMLButtonElement;
      const overlay = el.querySelector('.comic-helper-search-spinner-overlay') as HTMLElement;

      setUpdating(true);
      vi.advanceTimersByTime(200); 
      expect(overlay.classList.contains('visible')).toBe(true);

      setUpdating(false);
      expect(overlay.classList.contains('visible')).toBe(true);
      expect(input.disabled).toBe(true);

      vi.advanceTimersByTime(400);
      expect(overlay.classList.contains('visible')).toBe(false);
      expect(input.disabled).toBe(false);
      expect(submitBtn.disabled).toBe(false);
    });
  });

  describe('tag trend filtering', () => {
    const resultsWithUrls: SearchResultsState = {
      results: [
        { title: 'Work A', href: '/work/1/', thumb: '' },
        { title: 'Work B', href: '/work/2/', thumb: '' }
      ],
      totalCount: '2', nextPageUrl: null, pagination: []
    };

    it('should update work tags cache and show trend section', () => {
      const { el, updateWorkTagsCache } = createSearchModal({ ...defaultProps, searchResults: resultsWithUrls });
      const trend = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
      expect(trend.style.display).toBe('none');

      updateWorkTagsCache({
        '/work/1/': [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      });

      const updatedTrend = el.querySelector('.comic-helper-favorites-trend-section') as HTMLElement;
      expect(updatedTrend.style.display).not.toBe('none');
    });

    it('should filter results when trend tag is clicked', () => {
      const { el, updateWorkTagsCache } = createSearchModal({ ...defaultProps, searchResults: resultsWithUrls });
      updateWorkTagsCache({
        '/work/1/': [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      });

      const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
      tagBtn.click();

      const grid = el.querySelector('.comic-helper-search-result-grid') as HTMLElement;
      expect(grid.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(1);

      // Click again to deselect
      const activeBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
      activeBtn.click();
      expect(el.querySelector('.comic-helper-search-result-grid')!.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);
    });

    it('should update pinned tags and re-render trend section', () => {
      const onTogglePinTag = vi.fn();
      const { el, updateWorkTagsCache, updatePinnedTags } = createSearchModal({
        ...defaultProps,
        searchResults: resultsWithUrls,
        onTogglePinTag
      });

      updateWorkTagsCache({
        '/work/1/': [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      });

      // No active pin buttons initially
      expect(el.querySelector('.comic-helper-tag-pin.active')).toBeNull();

      updatePinnedTags(['fantasy']);

      // Now pin button should be active
      expect(el.querySelector('.comic-helper-tag-pin.active')).not.toBeNull();
    });

    it('should reset tag selection when updateResults is called', () => {
      const { el, updateWorkTagsCache, updateResults } = createSearchModal({ ...defaultProps, searchResults: resultsWithUrls });
      updateWorkTagsCache({
        '/work/1/': [{ text: 'fantasy', href: '/tags/fantasy', type: 'genre' }]
      });

      const tagBtn = el.querySelector('.comic-helper-favorites-trend-tags button') as HTMLElement;
      tagBtn.click();
      expect(el.querySelector('.comic-helper-search-result-grid')!.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(1);

      // Update results should reset filters
      updateResults(resultsWithUrls);
      expect(el.querySelector('.comic-helper-search-result-grid')!.querySelectorAll('.comic-helper-search-result-item')).toHaveLength(2);
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
    it('should handle setUpdating with transitions', () => {
      vi.useFakeTimers();
      const { setUpdating } = createSearchModal(defaultProps);
      
      setUpdating(true);
      vi.advanceTimersByTime(1000);
      
      setUpdating(false);
      vi.advanceTimersByTime(1000);
      
      vi.useRealTimers();
    });

    it('should handle updateResults with null pagination', () => {
      const { updateResults } = createSearchModal(defaultProps);
      updateResults({ results: [], totalCount: '0', nextPageUrl: null, pagination: [] });
    });
  });
});
