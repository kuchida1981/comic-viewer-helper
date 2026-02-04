import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {Function} props.onFirst
 * @param {Function} props.onPrev
 * @param {Function} props.onNext
 * @param {Function} props.onLast
 * @param {Function} props.onInfo
 * @param {Function} props.onHelp
 * @param {Function} [props.onLucky]
 */
export function createNavigationButtons({ onFirst, onPrev, onNext, onLast, onInfo, onHelp, onLucky }) {
  const configs = [
    { text: '<<', title: t('ui.goLast'), action: onLast },
    { text: '<', title: t('ui.goNext'), action: onNext },
    { text: '🎲', title: t('ui.lucky'), action: onLucky, className: 'comic-helper-button comic-helper-power-btn enabled' },
    { text: '>', title: t('ui.goPrev'), action: onPrev },
    { text: '>>', title: t('ui.goFirst'), action: onFirst },
    { text: 'Info', title: t('ui.showMetadata'), action: onInfo },
    { text: '?', title: t('ui.showHelp'), action: onHelp }
  ];

  const elements = configs
    .map(cfg => createElement('button', {
      className: cfg.className || 'comic-helper-button',
      textContent: cfg.text,
      title: cfg.title,
      events: {
        click: (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (cfg.action) cfg.action();
          if (e.target instanceof HTMLElement) e.target.blur();
        }
      }
    }));

  return {
    elements,
    update: () => {} // No dynamic state for these buttons yet
  };
}
