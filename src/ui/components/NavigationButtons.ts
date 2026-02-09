import { createElement } from '../utils';
import { t } from '../../i18n';

export interface NavigationButtonsProps {
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onInfo: () => void;
  onHelp: () => void;
  onSearch: () => void;
  onLucky: () => void;
  onAutoplay: () => void;
  isAutoplayEnabled: boolean;
}

export interface NavigationButtonsComponent {
  elements: HTMLElement[];
  update: (isAutoplayEnabled: boolean) => void;
}

export function createNavigationButtons({
  onFirst, onPrev, onNext, onLast, onInfo, onHelp, onSearch, onLucky, onAutoplay, isAutoplayEnabled
}: NavigationButtonsProps): NavigationButtonsComponent {
  const configs = [
    { text: '<<', title: t('ui.goLast'), action: onLast },
    { text: '<', title: t('ui.goNext'), action: onNext },
    { text: isAutoplayEnabled ? '||' : '◀', title: isAutoplayEnabled ? t('ui.stopAutoplay') : t('ui.autoplay'), action: onAutoplay, id: 'autoplay-btn' },
    { text: '🎲', title: t('ui.lucky'), action: onLucky, className: 'comic-helper-button comic-helper-icon-btn' },
    { text: '>', title: t('ui.goPrev'), action: onPrev },
    { text: '>>', title: t('ui.goFirst'), action: onFirst },
    { text: 'Info', title: t('ui.showMetadata'), action: onInfo },
    { text: '?', title: t('ui.showHelp'), action: onHelp },
    { text: '🔍', title: t('ui.showSearch'), action: onSearch, className: 'comic-helper-button comic-helper-icon-btn' }
  ];

  const elements = configs
    .map(cfg => {
      const btn = createElement('button', {
        className: cfg.className || 'comic-helper-button',
        textContent: cfg.text,
        title: cfg.title,
        events: {
          click: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (cfg.action) cfg.action();
            const target = e.currentTarget as HTMLElement;
            if (target && typeof target.blur === 'function') {
              target.blur();
            }
          }
        }
      });
      if (cfg.id) {
        btn.id = cfg.id;
      }
      return btn;
    });

  return {
    elements,
    update: (autoplay: boolean) => {
      const btn = elements.find(el => el.id === 'autoplay-btn');
      if (btn) {
        btn.textContent = autoplay ? '||' : '◀';
        btn.title = autoplay ? t('ui.stopAutoplay') : t('ui.autoplay');
      }
    }
  };
}