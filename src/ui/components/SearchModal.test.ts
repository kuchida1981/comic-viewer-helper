import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      'ui.searchNoResults': 'No results'
    };
    return map[key] || key;
  }
}));

describe('SearchModal Header Display', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should display default header when no context provided', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
        const el: any = {
            tagName: tag,
            className: props?.className,
            appendChild: vi.fn(),
            addEventListener: vi.fn(),
            style: {},
            classList: { add: vi.fn(), remove: vi.fn() },
            focus: vi.fn(),
            textContent: props?.textContent || ''
        };
        createdElements.push(el);
        return el;
    });

    const results: SearchResultsState = {
      results: [],
      totalCount: '5',
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

    const headerEl = createdElements.find(el => el.className === 'comic-helper-section-title');
    expect(headerEl).toBeDefined();
    expect(headerEl.textContent).toBe('Results (5)');
  });

  it('should display tag context in header', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
        const el: any = {
            tagName: tag,
            className: props?.className,
            appendChild: vi.fn(),
            addEventListener: vi.fn(),
            style: {},
            classList: { add: vi.fn(), remove: vi.fn() },
            focus: vi.fn(),
            textContent: props?.textContent || ''
        };
        createdElements.push(el);
        return el;
    });

    const results: SearchResultsState = {
      results: [],
      totalCount: '10',
      nextPageUrl: null,
      pagination: [],
      searchContext: { type: 'tag', label: 'MyTag' }
    };

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: results,
      searchHistory: []
    });

    const headerEl = createdElements.find(el => el.className === 'comic-helper-section-title');
    expect(headerEl).toBeDefined();
    expect(headerEl.textContent).toBe('Tag: MyTag (10)');
  });

  it('should display genre context in header', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const createdElements: any[] = [];
    vi.spyOn(utils, 'createElement').mockImplementation((tag, props) => {
        const el: any = {
            tagName: tag,
            className: props?.className,
            appendChild: vi.fn(),
            addEventListener: vi.fn(),
            style: {},
            classList: { add: vi.fn(), remove: vi.fn() },
            focus: vi.fn(),
            textContent: props?.textContent || ''
        };
        createdElements.push(el);
        return el;
    });

    const results: SearchResultsState = {
      results: [],
      totalCount: '3',
      nextPageUrl: null,
      pagination: [],
      searchContext: { type: 'genre', label: 'Action' }
    };

    createSearchModal({
      onSearch: vi.fn(),
      onPageChange: vi.fn(),
      onClose: vi.fn(),
      searchResults: results,
      searchHistory: []
    });

    const headerEl = createdElements.find(el => el.className === 'comic-helper-section-title');
    expect(headerEl).toBeDefined();
    expect(headerEl.textContent).toBe('Genre: Action (3)');
  });
});