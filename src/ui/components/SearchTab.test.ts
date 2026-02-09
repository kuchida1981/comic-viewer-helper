import { describe, it, expect, vi } from 'vitest';
import { createSearchTab } from './SearchTab';
import { t } from '../../i18n';

describe('SearchTab', () => {
  const defaultProps = {
    onSearch: vi.fn(),
    onPageChange: vi.fn(),
    searchResults: null,
    searchHistory: []
  };

  it('should render search form', () => {
    const { el } = createSearchTab(defaultProps);
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe(t('ui.searchPlaceholder'));
    expect(el.querySelector('button[type="submit"]')).not.toBeNull();
  });

  it('should call onSearch on submit', () => {
    const onSearch = vi.fn();
    const { el } = createSearchTab({ ...defaultProps, onSearch });
    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'test query';
    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should render history chips', () => {
    const { el } = createSearchTab({ ...defaultProps, searchHistory: ['h1', 'h2'] });
    const chips = el.querySelectorAll('.comic-helper-search-history-item');
    expect(chips).toHaveLength(2);
    expect(chips[0].textContent).toBe('h1');
  });

  it('should update results', () => {
    const { el, updateResults } = createSearchTab(defaultProps);
    const results = {
      results: [{ title: 'Work A', href: '/a', thumb: 'a.jpg' }],
      totalCount: '1',
      nextPageUrl: null,
      pagination: []
    };
    updateResults(results);
    expect(el.textContent).toContain('Work A');
  });

  it('should render pagination and call onPageChange', () => {
    const onPageChange = vi.fn();
    const results = {
      results: [{ title: 'A', href: '/a', thumb: 'a.jpg' }],
      totalCount: '10',
      nextPageUrl: '/p2',
      pagination: [
        { label: '1', url: null, isCurrent: true, type: 'page' as const },
        { label: '2', url: '/p2', isCurrent: false, type: 'page' as const }
      ]
    };
    const { el } = createSearchTab({ ...defaultProps, searchResults: results, onPageChange });
    
    const p2Btn = el.querySelectorAll('.comic-helper-search-page-btn')[1] as HTMLElement;
    expect(p2Btn.textContent).toBe('2');
    p2Btn.click();
    expect(onPageChange).toHaveBeenCalledWith('/p2');
  });

  it('should show no results message', () => {
    const results = { results: [], totalCount: '0', nextPageUrl: null, pagination: [] };
    const { el } = createSearchTab({ ...defaultProps, searchResults: results });
    expect(el.textContent).toContain(t('ui.searchNoResults'));
  });

  it('should show search context in title', () => {
    const results = { 
      results: [], totalCount: '0', nextPageUrl: null, pagination: [],
      searchContext: { type: 'tag' as const, label: 'MyTag' } 
    };
    const { el } = createSearchTab({ ...defaultProps, searchResults: results });
    expect(el.textContent).toContain('Tag: MyTag');
  });
});
