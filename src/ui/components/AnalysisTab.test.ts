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

  it('should handle record without tags', () => {
    const el = createAnalysisTab({ history: [{ url: 'u', title: 'T', thumb: '', tags: [], lastViewedAt: 0 }], onTagClick: vi.fn() });
    expect(el.querySelectorAll('.comic-helper-analysis-section')).toHaveLength(0);
  });

  it('should aggregate and render rankings', () => {
    const el = createAnalysisTab({ history, onTagClick: vi.fn() });
    expect(el.textContent).toContain('Tag A (2)');
    expect(el.textContent).toContain('Artist X (1)');
  });

  it('should handle duplicate tags within same record', () => {
    const historyWithDupes = [
      { 
        url: 'u', title: 'T', thumb: '', 
        tags: [
          { text: 'A', href: 'h', type: 'genre' },
          { text: 'A', href: 'h', type: 'genre' }
        ], 
        lastViewedAt: 0 
      }
    ];
    const el = createAnalysisTab({ history: historyWithDupes, onTagClick: vi.fn() });
    expect(el.textContent).toContain('A (2)');
  });

  it('should call onTagClick when a tag chip is clicked', () => {
    const onTagClick = vi.fn();
    const el = createAnalysisTab({ history, onTagClick });
    const chip = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    chip.click();
    expect(onTagClick).toHaveBeenCalledWith(history[0].tags[0]);
  });

  it('should call onTagClick when an artist chip is clicked', () => {
    const onTagClick = vi.fn();
    const el = createAnalysisTab({ history, onTagClick });
    const chips = el.querySelectorAll('.comic-helper-tag-chip');
    // Second chip is artist
    (chips[1] as HTMLElement).click();
    expect(onTagClick).toHaveBeenCalledWith(history[0].tags[1]);
  });

  it('should call onTagClick when another artist chip is clicked', () => {
    const onTagClick = vi.fn();
    const el = createAnalysisTab({ history, onTagClick });
    const chips = el.querySelectorAll('.comic-helper-tag-chip');
    // Second chip is artist
    const artistChip = chips[1] as HTMLElement;
    artistChip.click();
    expect(onTagClick).toHaveBeenCalledWith(history[0].tags[1]);
  });

  it('should prevent default on tag click', () => {
    const el = createAnalysisTab({ history, onTagClick: vi.fn() });
    const chip = el.querySelector('.comic-helper-tag-chip') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const spy = vi.spyOn(event, 'preventDefault');
    chip.dispatchEvent(event);
    expect(spy).toHaveBeenCalled();
  });
});
