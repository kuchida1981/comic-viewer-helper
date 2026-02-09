import { describe, it, expect, vi } from 'vitest';
import { createHistoryTab } from './HistoryTab';
import { t } from '../../i18n';

describe('HistoryTab', () => {
  const history = [
    { url: 'u1', title: 'Manga 1', thumb: 't1.jpg', tags: [], lastViewedAt: Date.now() }
  ];

  it('should render empty message when no history', () => {
    const el = createHistoryTab({ history: [], onDelete: vi.fn(), onClear: vi.fn() });
    expect(el.textContent).toContain(t('ui.noHistory'));
  });

  it('should render history items', () => {
    const el = createHistoryTab({ history, onDelete: vi.fn(), onClear: vi.fn() });
    expect(el.textContent).toContain('Manga 1');
    expect(el.querySelector('img')?.src).toContain('t1.jpg');
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    const el = createHistoryTab({ history, onDelete, onClear: vi.fn() });
    const btn = el.querySelector('.comic-helper-history-delete') as HTMLElement;
    btn.click();
    expect(onDelete).toHaveBeenCalledWith('u1');
  });

  it('should call onClear when clear button is clicked', () => {
    const onClear = vi.fn();
    const el = createHistoryTab({ history, onDelete: vi.fn(), onClear });
    const btn = el.querySelector('.comic-helper-button') as HTMLElement;
    btn.click();
    expect(onClear).toHaveBeenCalled();
  });
});
