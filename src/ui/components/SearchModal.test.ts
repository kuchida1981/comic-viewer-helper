import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchModal } from './SearchModal';
import { t } from '../../i18n';

const defaultProps = { 
  onSearch: () => {}, 
  onPageChange: () => {}, 
  onClose: () => {}, 
  onDeleteHistory: () => {},
  onClearHistory: () => {},
  searchResults: null,
  searchHistory: [],
  history: []
};

describe('SearchModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render title and tabs', () => {
    const { el } = createSearchModal(defaultProps);
    expect(el.textContent).toContain(t('ui.search'));
    expect(el.textContent).toContain(t('ui.searchTab'));
    expect(el.textContent).toContain(t('ui.historyTab'));
    expect(el.textContent).toContain(t('ui.analysisTab'));
  });

  it('should switch tabs', () => {
    const { el, setTab } = createSearchModal(defaultProps);
    
    setTab('history');
    expect(el.querySelector('.comic-helper-tab-content')?.textContent).toContain(t('ui.noHistory'));
    
    setTab('search');
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toContain(t('ui.searchPlaceholder'));
  });

  it('should call onSearch when submitting the form in search tab', () => {
    const onSearch = vi.fn();
    const { el } = createSearchModal({ ...defaultProps, onSearch });
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'test query';
    const form = el.querySelector('form') as HTMLFormElement;
    const event = new Event('submit', { cancelable: true, bubbles: true });
    form.dispatchEvent(event);
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ ...defaultProps, onClose });
    el.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should render browsing history', () => {
    const history = [
      { url: 'url1', title: 'Manga 1', thumb: 't1.jpg', tags: [], lastViewedAt: Date.now() }
    ];
    const { el, setTab } = createSearchModal({ ...defaultProps, history });
    setTab('history');
    expect(el.textContent).toContain('Manga 1');
  });

  it('should call onDeleteHistory', () => {
    const onDeleteHistory = vi.fn();
    const history = [
      { url: 'url1', title: 'Manga 1', thumb: 't1.jpg', tags: [], lastViewedAt: Date.now() }
    ];
    const { el, setTab } = createSearchModal({ ...defaultProps, history, onDeleteHistory });
    setTab('history');
    const deleteBtn = el.querySelector('.comic-helper-history-delete') as HTMLElement;
    deleteBtn.click();
    expect(onDeleteHistory).toHaveBeenCalledWith('url1');
  });

  it('should prevent propagation on history item click', () => {
    const history = [{ url: 'u', title: 'T', thumb: '', tags: [], lastViewedAt: 0 }];
    const { el, setTab } = createSearchModal({ ...defaultProps, history });
    setTab('history');
    const item = el.querySelector('.comic-helper-search-result-item') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const spy = vi.spyOn(event, 'stopPropagation');
    item.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });

  it('should prevent propagation on history item click', () => {
    const history = [{ url: 'u', title: 'T', thumb: '', tags: [], lastViewedAt: 0 }];
    const { el, setTab } = createSearchModal({ ...defaultProps, history });
    setTab('history');
    const item = el.querySelector('.comic-helper-search-result-item') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const spy = vi.spyOn(event, 'stopPropagation');
    item.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });

  it('should call onClearHistory', () => {
    const onClearHistory = vi.fn();
    const { el, setTab } = createSearchModal({ ...defaultProps, onClearHistory, history: [{ url: 'u1', title: 'M1', thumb: '', tags: [], lastViewedAt: 0 }] });
    setTab('history');
    const clearBtn = el.querySelector('.comic-helper-button') as HTMLElement;
    clearBtn.click();
    expect(onClearHistory).toHaveBeenCalled();
  });

  it('should call onSearch when a tag is clicked in analysis tab', () => {
    const onSearch = vi.fn();
    const history = [
      { url: 'u1', title: 'M1', thumb: 't1.jpg', tags: [{ text: 'Tag A', href: 'hA', type: 'genre' }], lastViewedAt: Date.now() }
    ];
    const { el, setTab } = createSearchModal({ ...defaultProps, history, onSearch });
    setTab('analysis');
    
    const tagChip = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    tagChip.click();
    
    expect(onSearch).toHaveBeenCalledWith('hA', { type: 'tag', label: 'Tag A' });
  });

  describe('updating state', () => {
    it('should show loading indicators when setUpdating(true) after delay', () => {
      const { el, setUpdating } = createSearchModal(defaultProps);
      const overlay = el.querySelector('.comic-helper-search-spinner-overlay') as HTMLElement;
      const updatingText = el.querySelector('.comic-helper-search-updating') as HTMLElement;

      setUpdating(true);
      expect(updatingText.style.display).toBe('inline');
      
      expect(overlay.classList.contains('visible')).toBe(false);
      vi.advanceTimersByTime(200);
      expect(overlay.classList.contains('visible')).toBe(true);
    });

    it('should hide loading indicators when setUpdating(false)', () => {
      const { el, setUpdating } = createSearchModal(defaultProps);
      const overlay = el.querySelector('.comic-helper-search-spinner-overlay') as HTMLElement;

      setUpdating(true);
      vi.advanceTimersByTime(200);
      setUpdating(false);
      vi.advanceTimersByTime(400);
      expect(overlay.classList.contains('visible')).toBe(false);
    });
  });

  it('should update results', () => {
    const { el, updateResults } = createSearchModal(defaultProps);
    const results = {
      results: [{ title: 'New Work', href: '/new', thumb: 'n.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: []
    };
    updateResults(results);
    expect(el.textContent).toContain('New Work');
  });

  it('should update history', () => {
    const { el, setTab, updateHistory } = createSearchModal(defaultProps);
    setTab('history');
    const newHistory = [
      { url: 'new', title: 'New Manga', thumb: 'n.jpg', tags: [], lastViewedAt: Date.now() }
    ];
    updateHistory(newHistory);
    expect(el.textContent).toContain('New Manga');
  });

  it('should call onSearch when a tag is clicked in analysis tab', () => {
    const onSearch = vi.fn();
    const history = [
      { url: 'u1', title: 'M1', thumb: 't1.jpg', tags: [{ text: 'Tag A', href: 'hA', type: 'genre' }], lastViewedAt: Date.now() }
    ];
    const { el, setTab } = createSearchModal({ ...defaultProps, history, onSearch });
    setTab('analysis');
    
    const tagChip = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    tagChip.click();
    
    expect(onSearch).toHaveBeenCalledWith('hA', { type: 'tag', label: 'Tag A' });
  });

  it('should call onSearch when a tag is clicked in analysis tab', () => {
    const onSearch = vi.fn();
    const history = [
      { url: 'u1', title: 'M1', thumb: 't1.jpg', tags: [{ text: 'Tag A', href: 'hA', type: 'genre' }], lastViewedAt: Date.now() }
    ];
    const { el, setTab } = createSearchModal({ ...defaultProps, history, onSearch });
    setTab('analysis');
    
    const tagChip = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    tagChip.click();
    
    expect(onSearch).toHaveBeenCalledWith('hA', { type: 'tag', label: 'Tag A' });
  });

  it('should clear results grid when results are null', () => {
    const { el, updateResults } = createSearchModal(defaultProps);
    const results = {
      results: [{ title: 'Work', href: '/w', thumb: 'w.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: []
    };
    updateResults(results);
    expect(el.textContent).toContain('Work');

    updateResults(null);
    expect(el.querySelector('.comic-helper-search-result-grid')).toBeNull();
  });

  it('should activate tab buttons when setTab is called', () => {
    const { el, setTab } = createSearchModal(defaultProps);
    const historyBtn = el.querySelector('.comic-helper-tab-btn:nth-child(2)') as HTMLElement;
    
    setTab('history');
    expect(historyBtn.classList.contains('active')).toBe(true);
    
    const searchBtn = el.querySelector('.comic-helper-tab-btn:nth-child(1)') as HTMLElement;
    setTab('search');
    expect(searchBtn.classList.contains('active')).toBe(true);
    expect(historyBtn.classList.contains('active')).toBe(false);

    // analysis tab
    setTab('analysis');
    expect(el.textContent).toContain(t('ui.analysisTab'));
  });

  it('should update results and handle scroll reset', () => {
    const { el, updateResults, setTab } = createSearchModal(defaultProps);
    
    // search tab
    setTab('search');
    updateResults({ results: [], totalCount: '0', nextPageUrl: null, pagination: [] });
    
    // results = null
    updateResults(null);
    expect(el.querySelector('.comic-helper-search-result-grid')).toBeNull();

    // results = null in analysis tab
    setTab('analysis');
    updateResults(null);
  });

  it('should call onPageChange from search tab', () => {
    const onPageChange = vi.fn();
    const results = {
      results: [{ title: 'A', href: '/a', thumb: 'a.jpg' }],
      totalCount: '10',
      nextPageUrl: '/p2',
      pagination: [{ label: '2', url: '/p2', isCurrent: false, type: 'page' as const }]
    };
    const { el, updateResults } = createSearchModal({ ...defaultProps, onPageChange });
    updateResults(results);
    
    const p2Btn = el.querySelector('.comic-helper-search-page-btn') as HTMLElement;
    p2Btn.click();
    expect(onPageChange).toHaveBeenCalledWith('/p2');
  });

  it('should prevent propagation on result item click', () => {
    const results = {
      results: [{ title: 'A', href: '/a', thumb: 'a.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: []
    };
    const { el, updateResults } = createSearchModal(defaultProps);
    updateResults(results);
    
    const item = el.querySelector('.comic-helper-search-result-item') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const spy = vi.spyOn(event, 'stopPropagation');
    item.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
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
  });
});