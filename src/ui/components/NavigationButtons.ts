import { createElement } from '../utils';
import { t } from '../../i18n';
import { createHeartFilledIcon, createHeartOutlineIcon } from '../icons';

export interface NavigationButtonsProps {
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onInfo: () => void;
  onHelp: () => void;
  onSearch: () => void;
  onLucky: () => void;
  onToggleFavorite: () => void;
  onFavoritesList: () => void;
}

export interface NavigationButtonsComponent {
  elements: HTMLElement[];
  update: (isFavorite: boolean, isLuckyLoading: boolean) => void;
}

export function createNavigationButtons({
  onFirst, onPrev, onNext, onLast, onInfo, onHelp, onSearch, onLucky, onToggleFavorite, onFavoritesList
}: NavigationButtonsProps): NavigationButtonsComponent {
  const heartFilledIcon = createHeartFilledIcon(18);
  const heartOutlineIcon = createHeartOutlineIcon(18);

  const configs = [
    { text: '<<', title: t('ui.goLast'), action: onLast },
    { text: '<', title: t('ui.goNext'), action: onNext },
    { text: '🎲', title: t('ui.lucky'), action: onLucky, className: 'comic-helper-button comic-helper-icon-btn', id: 'lucky' },
    { text: '>', title: t('ui.goPrev'), action: onPrev },

        { text: '>>', title: t('ui.goFirst'), action: onFirst },
        { text: '', title: 'Toggle Favorite', action: onToggleFavorite, id: 'fav', className: 'comic-helper-favorite-btn' },
        { text: 'Info', title: t('ui.showMetadata'), action: onInfo },
        { text: '?', title: t('ui.showHelp'), action: onHelp },
        { text: '🔍', title: t('ui.showSearch'), action: onSearch, className: 'comic-helper-button comic-helper-icon-btn' },
        { text: '📚', title: t('ui.showFavoritesList'), action: onFavoritesList, className: 'comic-helper-button comic-helper-icon-btn' }
      ];
    
      const elements = configs
        .map(cfg => createElement('button', {
          id: cfg.id ? `comic-helper-nav-${cfg.id}` : undefined,
          className: cfg.className || 'comic-helper-button',
          textContent: cfg.text,
          title: cfg.title,
          events: {
            click: (e) => {
              e.preventDefault();
              e.stopPropagation();
              cfg.action();
              (e.currentTarget as HTMLElement).blur();
            }
          }
        }));
    
      return {
        elements,
        update: (isFavorite: boolean, isLuckyLoading: boolean) => {
          const favBtn = elements.find(el => el.id === 'comic-helper-nav-fav');
          if (favBtn) {
            favBtn.replaceChildren(isFavorite ? heartFilledIcon : heartOutlineIcon);
            favBtn.classList.toggle('active', isFavorite);
            favBtn.classList.toggle('inactive', !isFavorite);
          }

          const luckyBtn = elements.find(el => el.id === 'comic-helper-nav-lucky');
          if (luckyBtn instanceof HTMLButtonElement) {
            luckyBtn.disabled = isLuckyLoading;
            luckyBtn.classList.toggle('loading', isLuckyLoading);
            if (isLuckyLoading) {
              luckyBtn.textContent = '⏳';
            } else {
              luckyBtn.textContent = '🎲';
            }
          }
        }
      };
    }
    