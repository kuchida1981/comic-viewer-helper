import { createElement } from '../utils';
import { t } from '../../i18n';
import { COLORS } from '../styles';

export interface RedirectSettingsProps {
  isRedirectEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export interface RedirectSettingsComponent {
  el: HTMLElement;
  update: (enabled: boolean) => void;
}

export function createRedirectSettings({ isRedirectEnabled, onToggle }: RedirectSettingsProps): RedirectSettingsComponent {
  const checkbox = createElement('input', {
    attributes: { type: 'checkbox', id: 'comic-helper-redirect-enabled' },
    events: {
      change: (e) => {
        onToggle((e.currentTarget as HTMLInputElement).checked);
      }
    }
  }) as HTMLInputElement;
  checkbox.checked = isRedirectEnabled;

  const label = createElement('label', {
    attributes: { for: 'comic-helper-redirect-enabled' },
    textContent: t('ui.redirectEnabled'),
    style: { marginLeft: '6px', cursor: 'pointer' }
  });

  const row = createElement('div', {
    style: { display: 'flex', alignItems: 'center', marginBottom: '8px' }
  }, [checkbox, label]);

  const titleEl = createElement('div', {
    textContent: t('ui.redirectSettings'),
    style: {
      fontWeight: 'bold',
      fontSize: '13px',
      marginTop: '15px',
      marginBottom: '10px',
      paddingTop: '10px',
      borderTop: `1px solid ${COLORS.border.default}`
    }
  });

  const desc = createElement('div', {
    className: 'comic-helper-sync-description',
    textContent: t('ui.redirectDesc')
  });

  const el = createElement('div', {}, [titleEl, row, desc]);

  return {
    el,
    update: (enabled: boolean) => {
      checkbox.checked = enabled;
    }
  };
}
