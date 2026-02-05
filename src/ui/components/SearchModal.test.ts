import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSearchModal } from './SearchModal';
import { t } from '../../i18n';

describe('SearchModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render title and input', () => {
    const { el } = createSearchModal({ onSearch: () => {}, onClose: () => {} });
    expect(el.textContent).toContain(t('ui.search'));
    const input = el.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toContain(t('ui.searchPlaceholder'));
  });

  it('should call onSearch when clicking submit button', () => {
    const onSearch = vi.fn();
    const { el, input } = createSearchModal({ onSearch, onClose: () => {} });
    input.value = 'test query';
    const submitBtn = el.querySelector('.comic-helper-search-submit') as HTMLElement;
    submitBtn.click();
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('should call onSearch when pressing Enter key', () => {
    const onSearch = vi.fn();
    const { input } = createSearchModal({ onSearch, onClose: () => {} });
    input.value = 'enter query';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    input.dispatchEvent(event);
    expect(onSearch).toHaveBeenCalledWith('enter query');
  });

  it('should not call onSearch if query is empty', () => {
    const onSearch = vi.fn();
    const { el, input } = createSearchModal({ onSearch, onClose: () => {} });
    input.value = '   ';
    const submitBtn = el.querySelector('.comic-helper-search-submit') as HTMLElement;
    submitBtn.click();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('should call onClose when clicking overlay', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ onSearch: () => {}, onClose });
    el.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ onSearch: () => {}, onClose });
    const closeBtn = el.querySelector('.comic-helper-modal-close') as HTMLElement;
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('should stop propagation when clicking content', () => {
    const onClose = vi.fn();
    const { el } = createSearchModal({ onSearch: () => {}, onClose });
    const content = el.querySelector('.comic-helper-modal-content') as HTMLElement;
    content.click();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should focus input after a delay', () => {
    const { input } = createSearchModal({ onSearch: () => {}, onClose: () => {} });
    const focusSpy = vi.spyOn(input, 'focus');
    vi.advanceTimersByTime(50);
    expect(focusSpy).toHaveBeenCalled();
  });
});
