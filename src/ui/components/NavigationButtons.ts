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
  navElements: HTMLElement[];
  utilElements: HTMLElement[];
  update: (isFavorite: boolean, isLuckyLoading: boolean) => void;
}

export function createNavigationButtons({
  onFirst, onPrev, onNext, onLast, onInfo, onHelp, onSearch, onLucky, onToggleFavorite, onFavoritesList
}: NavigationButtonsProps): NavigationButtonsComponent {
  const heartFilledIcon = createHeartFilledIcon(18);
  const heartOutlineIcon = createHeartOutlineIcon(18);

  type BtnConfig = { text: string; title: string; action: () => void; className?: string; id?: string };

  const navConfigs: BtnConfig[] = [
    { text: '<<', title: t('ui.goLast'), action: onLast },
    { text: '<', title: t('ui.goNext'), action: onNext },
    { text: '🎲', title: t('ui.lucky'), action: onLucky, className: 'comic-helper-button comic-helper-icon-btn', id: 'lucky' },
    { text: '>', title: t('ui.goPrev'), action: onPrev },
    { text: '>>', title: t('ui.goFirst'), action: onFirst },
  ];

  const utilConfigs: BtnConfig[] = [
    { text: '', title: 'Toggle Favorite', action: onToggleFavorite, id: 'fav', className: 'comic-helper-favorite-btn' },
    { text: 'ℹ️', title: t('ui.showMetadata'), action: onInfo, className: 'comic-helper-button comic-helper-icon-btn' },
    { text: '❓', title: t('ui.showHelp'), action: onHelp, className: 'comic-helper-button comic-helper-icon-btn' },
    { text: '🔍', title: t('ui.showSearch'), action: onSearch, className: 'comic-helper-button comic-helper-icon-btn' },
    { text: '📚', title: t('ui.showFavoritesList'), action: onFavoritesList, className: 'comic-helper-button comic-helper-icon-btn' },
  ];

  const makeBtn = (cfg: BtnConfig) => createElement('button', {
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
  });

  const navElements = navConfigs.map(makeBtn);
  const utilElements = utilConfigs.map(makeBtn);
  const favBtn = utilElements.find(el => el.id === 'comic-helper-nav-fav');
  const luckyBtn = navElements.find(el => el.id === 'comic-helper-nav-lucky');

  return {
    navElements,
    utilElements,
    update: (isFavorite: boolean, isLuckyLoading: boolean) => {
      if (favBtn) {
        favBtn.replaceChildren(isFavorite ? heartFilledIcon : heartOutlineIcon);
        favBtn.classList.toggle('active', isFavorite);
        favBtn.classList.toggle('inactive', !isFavorite);
      }

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
