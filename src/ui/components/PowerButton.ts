import { createElement } from '../utils';
import { t } from '../../i18n';

export interface PowerButtonProps {
  isEnabled: boolean;
  onClick: () => void;
}

export interface PowerButtonComponent {
  el: HTMLElement;
  update: (enabled: boolean) => void;
}

export function createPowerButton({ isEnabled, onClick }: PowerButtonProps): PowerButtonComponent {
  const el = createElement('button', {
    className: `comic-helper-icon-btn comic-helper-power-btn ${isEnabled ? 'enabled' : 'disabled'}`,
    title: isEnabled ? t('ui.disable') : t('ui.enable'),
    textContent: '⚡',
    style: {
      marginRight: isEnabled ? '8px' : '0'
    },
    events: {
      click: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }
    }
  });

  return {
    el,
    update: (enabled: boolean) => {
      el.className = `comic-helper-icon-btn comic-helper-power-btn ${enabled ? 'enabled' : 'disabled'}`;
      el.title = enabled ? t('ui.disable') : t('ui.enable');
      el.style.marginRight = enabled ? '8px' : '0';
    }
  };
}