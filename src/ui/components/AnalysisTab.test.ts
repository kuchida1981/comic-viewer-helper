import { describe, it, expect, vi } from 'vitest';
import { createAnalysisTab } from './AnalysisTab';
import { t } from '../../i18n';

describe('AnalysisTab', () => {
  const history = [
    { 
      url: 'u1', 
      title: 'M1', 
      thumb: 't1.jpg', 
      tags: [
        { text: 'Tag A', href: 'hA', type: 'genre' },
        { text: 'Artist X', href: 'hX', type: 'artist' }
      ], 
      lastViewedAt: Date.now() 
    },
    { 
      url: 'u2', 
      title: 'M2', 
      thumb: 't2.jpg', 
      tags: [
        { text: 'Tag A', href: 'hA', type: 'genre' }
      ], 
      lastViewedAt: Date.now() 
    }
  ];

  it('should render empty message when no history', () => {
    const el = createAnalysisTab({ history: [], onTagClick: vi.fn() });
    expect(el.textContent).toContain(t('ui.noHistory'));
  });

  it('should aggregate and render rankings', () => {
    const el = createAnalysisTab({ history, onTagClick: vi.fn() });
    expect(el.textContent).toContain('Tag A (2)');
    expect(el.textContent).toContain('Artist X (1)');
  });

  it('should call onTagClick when a tag chip is clicked', () => {
    const onTagClick = vi.fn();
    const el = createAnalysisTab({ history, onTagClick });
    const chip = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    chip.click();
    expect(onTagClick).toHaveBeenCalledWith(history[0].tags[0]);
  });
});
