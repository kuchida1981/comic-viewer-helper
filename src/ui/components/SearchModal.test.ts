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