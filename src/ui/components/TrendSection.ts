import { createElement } from '../utils';
import { t } from '../../i18n';
import { RelatedWork } from '../../types';
import { calculateTrends } from '../../logic';
import { createPinFilledIcon } from '../icons';

export interface TrendSectionOptions {
  works: RelatedWork[];
  selectedTagTexts: Set<string>;
  pinnedTags?: string[];
  onTagClick: (tagText: string) => void;
  onTogglePinTag?: (tagText: string) => void;
  showAllTags: boolean;
  onToggleShowAll: () => void;
}

export function createTrendSection(options: TrendSectionOptions): HTMLElement {
  const {
    works,
    selectedTagTexts,
    pinnedTags = [],
    onTagClick,
    onTogglePinTag,
    showAllTags,
    onToggleShowAll
  } = options;

  const section = createElement('div', {
    className: 'comic-helper-favorites-trend-section'
  });

  const trends = calculateTrends(works, showAllTags ? 0 : 10, pinnedTags, Array.from(selectedTagTexts));
  if (trends.length === 0) {
    section.style.display = 'none';
    return section;
  }

  const toggleBtn = createElement('button', {
    className: 'comic-helper-trend-toggle-btn',
    textContent: showAllTags ? t('ui.showTopTags') : t('ui.showAllTags'),
    events: { click: onToggleShowAll }
  });

  const labelRow = createElement('div', {
    className: 'comic-helper-favorites-trend-label-row'
  }, [
    createElement('div', {
      className: 'comic-helper-favorites-trend-label',
      textContent: t('ui.favoritesTrend')
    }),
    toggleBtn
  ]);

  const tagsEl = createElement('div', {
    className: 'comic-helper-favorites-trend-tags'
  });

  trends.forEach(({ tag, count, isPinned }) => {
    const typeClass = tag.type ? `comic-helper-tag-chip--${tag.type}` : '';
    const activeClass = selectedTagTexts.has(tag.text) ? ' active' : '';
    const chip = createElement('button', {
      className: `comic-helper-tag-chip${activeClass}`,
      textContent: `${tag.text} (${count})`,
      events: {
        click: () => onTagClick(tag.text)
      }
    });

    const children: HTMLElement[] = [chip];

    if (onTogglePinTag) {
      const pinBtn = createElement('button', {
        className: `comic-helper-tag-pin${isPinned ? ' active' : ''}`,
        title: isPinned ? t('ui.unpinTag') : t('ui.pinTag'),
        events: {
          click: (e) => {
            e.stopPropagation();
            onTogglePinTag(tag.text);
          }
        }
      });
      pinBtn.appendChild(createPinFilledIcon());
      children.push(pinBtn);
    }

    const container = createElement('div', {
      className: `comic-helper-tag-chip-container${typeClass ? ` ${typeClass}` : ''}`
    }, children);
    tagsEl.appendChild(container);
  });

  section.appendChild(labelRow);
  section.appendChild(tagsEl);
  return section;
}
