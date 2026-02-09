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

export const createAnalysisTab = function createAnalysisTab(props: AnalysisTabProps): HTMLElement {
  const { history, onTagClick } = props;
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

  const aggregateRecord = function aggregateRecord(record: HistoryRecord) {
    const aggregateTag = function aggregateTag(tag: Tag) {
      const counts = (tag.type === 'artist') ? artistCounts : tagCounts;
      const existing = counts.get(tag.text);
      if (existing) {
        existing.count++;
      } else {
        counts.set(tag.text, { tag, count: 1 });
      }
    };
    record.tags.forEach(aggregateTag);
  };
  history.forEach(aggregateRecord);

  const sortRanking = function sortRanking(a: TagCount, b: TagCount) { return b.count - a.count; };
  const sortedTags = Array.from(tagCounts.values()).sort(sortRanking).slice(0, 20);
  const sortedArtists = Array.from(artistCounts.values()).sort(sortRanking).slice(0, 20);

  const renderRanking = function renderRankingSection(title: string, data: TagCount[]) {
    const section = createElement('div', { className: 'comic-helper-analysis-section', style: { marginBottom: '20px' } });
    section.appendChild(createElement('h3', { textContent: title, style: { fontSize: '16px', borderBottom: '1px solid #444', paddingBottom: '4px' } }));
    
    const list = createElement('div', { className: 'comic-helper-tag-list', style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' } });
    
    const renderTagChip = function renderTagChip(item: TagCount) {
      const chip = createElement('button', {
        className: 'comic-helper-tag-chip',
        textContent: `${item.tag.text} (${item.count})`,
        events: {
          click: function handleTagClick(e: Event) {
            e.preventDefault();
            onTagClick(item.tag);
          }
        }
      });
      list.appendChild(chip);
    };
    data.forEach(renderTagChip);
    section.appendChild(list);
    return section;
  };

  if (sortedTags.length > 0) {
    container.appendChild(renderRanking(t('ui.topTags'), sortedTags));
  }
  if (sortedArtists.length > 0) {
    container.appendChild(renderRanking(t('ui.topArtists'), sortedArtists));
  }

  return container;
}
