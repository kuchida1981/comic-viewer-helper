import { createElement } from '../utils';
import { t } from '../../i18n';
import { HistoryRecord } from '../../managers/HistoryManager';
import { Tag } from '../../types';

export interface AnalysisTabProps {
  history: HistoryRecord[];
  onTagClick: (tag: Tag) => void;
}

interface TagCount {
  tag: Tag;
  count: number;
}

export function createAnalysisTab({ history, onTagClick }: AnalysisTabProps): HTMLElement {
  const container = createElement('div', {
    className: 'comic-helper-tab-content comic-helper-search-container'
  });

  if (history.length === 0) {
    container.appendChild(createElement('div', {
      className: 'comic-helper-search-no-results',
      textContent: t('ui.noHistory')
    }));
    return container;
  }

  // Aggregate tags
  const tagCounts = new Map<string, TagCount>();
  const artistCounts = new Map<string, TagCount>();

  history.forEach(record => {
    record.tags.forEach(tag => {
      const counts = (tag.type === 'artist') ? artistCounts : tagCounts;
      const existing = counts.get(tag.text);
      if (existing) {
        existing.count++;
      } else {
        counts.set(tag.text, { tag, count: 1 });
      }
    });
  });

  const sortedTags = Array.from(tagCounts.values()).sort((a, b) => b.count - a.count).slice(0, 20);
  const sortedArtists = Array.from(artistCounts.values()).sort((a, b) => b.count - a.count).slice(0, 20);

  const renderRanking = (title: string, data: TagCount[]) => {
    const section = createElement('div', { className: 'comic-helper-analysis-section', style: { marginBottom: '20px' } });
    section.appendChild(createElement('h3', { textContent: title, style: { fontSize: '16px', borderBottom: '1px solid #444', paddingBottom: '4px' } }));
    
    const list = createElement('div', { className: 'comic-helper-tag-list', style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' } });
    data.forEach(item => {
      const chip = createElement('button', {
        className: 'comic-helper-tag-chip',
        textContent: `${item.tag.text} (${item.count})`,
        events: {
          click: (e) => {
            e.preventDefault();
            onTagClick(item.tag);
          }
        }
      });
      list.appendChild(chip);
    });
    section.appendChild(list);
    return section;
  };

  container.appendChild(renderRanking(t('ui.topTags'), sortedTags));
  if (sortedArtists.length > 0) {
    container.appendChild(renderRanking(t('ui.topArtists'), sortedArtists));
  }

  return container;
}
