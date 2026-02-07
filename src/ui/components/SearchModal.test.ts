import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchModal } from './SearchModal';
import { SearchResultsState } from '../../types';
import * as utils from '../utils';

// Mock i18n
vi.mock('../../i18n', () => ({
  t: (key: string) => {
    const map: Record<string, string> = {
      'ui.searchResults': 'Results',
      'ui.search': 'Search',
      'ui.searchPlaceholder': 'Search...',
      'ui.close': 'Close',
      'ui.searchHistory': 'History',
      'ui.searchNoResults': 'No results',
      'ui.goNext': 'Next',
      'ui.goPrev': 'Prev'
    };
    return map[key] || key;
  }
}));

describe('SearchModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const createMockElement = (tag: string, props: any = {}) => {
    const el: any = {
      tagName: tag.toUpperCase(),
      className: props.className || '',
      id: props.id || '',
      textContent: props.textContent || '',
      attributes: props.attributes || {},
      events: props.events || {},
      appendChild: vi.fn(),
      replaceChild: vi.fn(),
      addEventListener: vi.fn(),
      remove: vi.fn(),
      focus: vi.fn(),
      style: props.style || {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        toggle: vi.fn(),
        contains: vi.fn()
      },
      dispatchEvent: vi.fn(),
      click: vi.fn(),
      value: props.value || '',
      disabled: false
    };
    return el;
  };

  it('should display search results grid and pagination', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const results: SearchResultsState = {
      results: [
        { title: 'Item 1', href: '/1', thumb: '1.jpg' },
        { title: 'Item 2', href: '/2', thumb: '2.jpg' }
      ],
      totalCount: '2',
      nextPageUrl: '/page2',
      pagination: [
        { label: '1', url: null, isCurrent: true, type: 'page' },
        { label: '2', url: '/page2', isCurrent: false, type: 'page' },
        { label: '>', url: '/page2', isCurrent: false, type: 'next' }
      ]
    };

    const onPageChange = vi.fn();
    createSearchModal({
      onSearch: vi.fn(),
      onPageChange,
      onClose: vi.fn(),
      searchResults: results,
      searchHistory: []
    });

    // Verify grid items
    const gridItems = createdElements.filter(el => el.className === 'comic-helper-search-result-item');
    expect(gridItems.length).toBe(2);
    expect(gridItems[0].attributes.href).toBe('/1');

    // Verify pagination
    const pageButtons = createdElements.filter(el => el.className.includes('comic-helper-search-page-btn'));
    expect(pageButtons.length).toBe(3);
    
    // Test pagination click
    const nextBtn = pageButtons.find(el => el.textContent === '2');
    if (nextBtn) {
      const clickHandler = nextBtn.events.click;
      const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
      clickHandler(event);
      expect(onPageChange).toHaveBeenCalledWith('/page2');
    }
  });

  it('should display "no results" message when results are empty', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const results: SearchResultsState = {
      results: [],
      totalCount: '0',
      nextPageUrl: null,
      pagination: []
    };

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: results,
      searchHistory: []
    });

    const noResults = createdElements.find(el => el.className === 'comic-helper-search-no-results');
    expect(noResults).toBeDefined();
    expect(noResults.textContent).toBe('No results');
  });

  it('should display and handle search history', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const onSearch = vi.fn();
    createSearchModal({
      onSearch,
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: ['query1', 'query2']
    });

    const historyItems = createdElements.filter(el => el.className === 'comic-helper-search-history-item');
    expect(historyItems.length).toBe(2);
    expect(historyItems[0].textContent).toBe('query1');

    // Click history item
    const clickHandler = historyItems[0].events.click;
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
    clickHandler(event);
    expect(onSearch).toHaveBeenCalledWith('query1');
  });

  it('should render empty section when searchResults is null', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: []
    });

    const resultsSection = createdElements.find(el => el.className === 'comic-helper-search-results-section');
    expect(resultsSection).toBeDefined();
    // Check if appendChild was called on this section (it shouldn't be if results are null)
    expect(resultsSection.appendChild).not.toHaveBeenCalled();
  });

  it('should handle setUpdating with anti-flicker logic', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const modal = createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: []
    });

    const spinnerOverlay = createdElements.find(el => el.className === 'comic-helper-search-spinner-overlay');
    const updatingIndicator = createdElements.find(el => el.className === 'comic-helper-search-updating');

    // Start updating
    modal.setUpdating(true);
    expect(updatingIndicator.style.display).toBe('inline');
    
    // Spinner should NOT be visible yet (due to delay)
    expect(spinnerOverlay.classList.add).not.toHaveBeenCalledWith('visible');

    // Advance time beyond delay (SHOW_DELAY_MS = 200)
    vi.advanceTimersByTime(250);
    expect(spinnerOverlay.classList.add).toHaveBeenCalledWith('visible');

    // Stop updating
    modal.setUpdating(false);
    expect(updatingIndicator.style.display).toBe('none');
    
    // Should NOT hide immediately if shown for less than MIN_SHOW_TIME_MS (400)
    expect(spinnerOverlay.classList.remove).not.toHaveBeenCalledWith('visible');

    // Advance time beyond minimum show time
    vi.advanceTimersByTime(450);
    expect(spinnerOverlay.classList.remove).toHaveBeenCalledWith('visible');
  });

  it('should handle setUpdating cancellation before delay', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const modal = createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: []
    });

    const spinnerOverlay = createdElements.find(el => el.className === 'comic-helper-search-spinner-overlay');

    modal.setUpdating(true);
    vi.advanceTimersByTime(50); // Less than delay (200)
    modal.setUpdating(false);
    
    vi.advanceTimersByTime(300);
    expect(spinnerOverlay.classList.add).not.toHaveBeenCalledWith('visible');
  });

  it('should handle pagination with disabled buttons', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const onPageChange = vi.fn();
    const results: SearchResultsState = {
      results: [{ title: 'A', href: '/a', thumb: 'a.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: [
        { label: '1', url: null, isCurrent: true, type: 'page' }
      ]
    };

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange,
      onClose: vi.fn(),
      searchResults: results,
      searchHistory: []
    });

    const currentBtn = createdElements.find(el => el.className.includes('active'));
    expect(currentBtn.attributes.disabled).toBe('true');
    
    const clickHandler = currentBtn.events.click;
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
    clickHandler(event);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should handle modal close actions', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const onClose = vi.fn();
    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose,
      searchResults: null,
      searchHistory: []
    });

    // Close via button
    const closeBtn = createdElements.find(el => el.className === 'comic-helper-modal-close');
    closeBtn.events.click({ preventDefault: vi.fn() });
    expect(onClose).toHaveBeenCalled();

    // Close via overlay
    const overlay = createdElements.find(el => el.className === 'comic-helper-modal-overlay');
    overlay.events.click();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should update results dynamically', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const modal = createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: []
    });

    // Clear the tracked elements list to verify only NEW elements created by updateResults
    createdElements.length = 0;

    const newResults: SearchResultsState = {
      results: [{ title: 'New Item', href: '/new', thumb: 'new.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: []
    };

    modal.updateResults(newResults);
    
    const titleEl = createdElements.find(el => el.className === 'comic-helper-search-result-title');
    expect(titleEl).toBeDefined();
    expect(titleEl.textContent).toBe('New Item');
  });

  it('should stop propagation on result item click', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const results: SearchResultsState = {
      results: [{ title: 'Item', href: '/1', thumb: '1.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: []
    };

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      searchResults: results,
      searchHistory: [],
      onClose: vi.fn()
    });

    const item = createdElements.find(el => el.className === 'comic-helper-search-result-item');
    const stopPropagation = vi.fn();
    item.events.click({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();
  });

  it('should stop propagation on modal content and overlay events', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: []
    });

    const content = createdElements.find(el => el.className === 'comic-helper-modal-content');
    const stopPropagation = vi.fn();
    
    // Test click on content
    content.events.click({ stopPropagation });
    expect(stopPropagation).toHaveBeenCalled();

    // Test wheel event on content
    const wheelHandler = content.addEventListener.mock.calls.find((c: any) => c[0] === 'wheel')[1];
    wheelHandler({ stopPropagation: stopPropagation.mockClear() });
    expect(stopPropagation).toHaveBeenCalled();

    // Test wheel event on overlay
    const overlay = createdElements.find(el => el.className === 'comic-helper-modal-overlay');
    const preventDefault = vi.fn();
    const overlayWheelHandler = overlay.addEventListener.mock.calls.find((c: any) => c[0] === 'wheel')[1];
    overlayWheelHandler({ stopPropagation: stopPropagation.mockClear(), preventDefault });
    expect(stopPropagation).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalled();
  });

  it('should handle search form submission', () => {
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
      const el = createMockElement(tag, props);
      createdElements.push(el);
      return el;
    });

    const onSearch = vi.fn();
    createSearchModal({
      onSearch,
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: null,
      searchHistory: []
    });

    const form = createdElements.find(el => el.tagName === 'FORM');
    const input = createdElements.find(el => el.tagName === 'INPUT');
    input.value = 'new search';

    const submitHandler = form.events.submit;
    const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
    submitHandler(event);

    expect(onSearch).toHaveBeenCalledWith('new search');
    expect(event.preventDefault).toHaveBeenCalled();
  });
});