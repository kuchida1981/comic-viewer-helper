import { createElement } from '../utils';
import { t } from '../../i18n';
import { SyncConfig } from '../../types';
import { COLORS } from '../styles';

export interface SyncSettingsProps {
  syncConfig: SyncConfig | null;
  onSave: (config: SyncConfig) => Promise<void>;
  lastError: string | null;
}

export interface SyncSettingsComponent {
  el: HTMLElement;
  update: (syncConfig: SyncConfig | null, lastError: string | null) => void;
}

function formatSyncTime(lastSyncedAt: number | null): string {
  if (!lastSyncedAt) return t('ui.syncNeverSynced');
  const date = new Date(lastSyncedAt);
  return t('ui.syncStatus').replace('{time}', date.toLocaleString());
}

function getStatusText(lastError: string | null, lastSyncedAt: number | null): string {
  if (lastError) return t('ui.syncError').replace('{error}', lastError);
  return formatSyncTime(lastSyncedAt);
}

function getStatusColor(lastError: string | null): string {
  return lastError ? '#ff6b6b' : COLORS.text.muted;
}

function createTextInput(type: 'password' | 'text', placeholder: string, value: string): HTMLInputElement {
  return createElement('input', {
    attributes: { type, placeholder, value },
    style: {
      width: '100%',
      boxSizing: 'border-box',
      background: COLORS.background.input,
      border: `1px solid ${COLORS.border.default}`,
      borderRadius: '3px',
      color: COLORS.text.primary,
      padding: '4px 6px',
      fontSize: '12px',
      marginBottom: '8px'
    }
  }) as HTMLInputElement;
}

function createEncryptionRow(syncConfig: SyncConfig | null): {
  encryptionModeSelect: HTMLSelectElement;
  encryptionPasswordRow: HTMLElement;
  encryptionPasswordInput: HTMLInputElement;
} {
  const encryptionModeSelect = createElement('select', {
    style: {
      width: '100%',
      boxSizing: 'border-box',
      background: COLORS.background.input,
      border: `1px solid ${COLORS.border.default}`,
      borderRadius: '3px',
      color: COLORS.text.primary,
      padding: '4px 6px',
      fontSize: '12px',
      marginBottom: '8px'
    }
  }) as HTMLSelectElement;

  const optionNone = document.createElement('option');
  optionNone.value = 'none';
  optionNone.textContent = t('ui.syncEncryptionNone');
  const optionAes = document.createElement('option');
  optionAes.value = 'aes';
  optionAes.textContent = t('ui.syncEncryptionAes');
  encryptionModeSelect.appendChild(optionNone);
  encryptionModeSelect.appendChild(optionAes);
  encryptionModeSelect.value = syncConfig ? syncConfig.encryptionMode : 'none';

  const encryptionPasswordInput = createTextInput(
    'password',
    t('ui.syncEncryptionPasswordPlaceholder'),
    syncConfig ? (syncConfig.encryptionPassword ?? '') : ''
  );

  const encryptionPasswordLabel = createElement('label', {
    textContent: t('ui.syncEncryptionPassword'),
    style: { display: 'block', fontSize: '11px', color: COLORS.text.muted, marginBottom: '3px' }
  });

  const encryptionPasswordRow = createElement('div', {}, [encryptionPasswordLabel, encryptionPasswordInput]);
  encryptionPasswordRow.style.display = encryptionModeSelect.value === 'aes' ? 'block' : 'none';

  encryptionModeSelect.addEventListener('change', () => {
    encryptionPasswordRow.style.display = encryptionModeSelect.value === 'aes' ? 'block' : 'none';
  });

  return { encryptionModeSelect, encryptionPasswordRow, encryptionPasswordInput };
}

export function createSyncSettings({ syncConfig, onSave, lastError }: SyncSettingsProps): SyncSettingsComponent {
  let currentConfig = syncConfig;
  let latestSyncConfig = syncConfig;
  let latestLastError = lastError;
  let isFeedbackShown = false;

  const enabledCheckbox = createElement('input', {
    attributes: { type: 'checkbox', id: 'comic-helper-sync-enabled' }
  }) as HTMLInputElement;
  enabledCheckbox.checked = syncConfig ? syncConfig.enabled : false;

  const enabledLabel = createElement('label', {
    attributes: { for: 'comic-helper-sync-enabled' },
    textContent: t('ui.syncEnabled'),
    style: { marginLeft: '6px', cursor: 'pointer' }
  });

  const enabledRow = createElement('div', {
    style: { display: 'flex', alignItems: 'center', marginBottom: '8px' }
  }, [enabledCheckbox, enabledLabel]);

  const patLabel = createElement('label', {
    textContent: t('ui.syncPat'),
    style: { display: 'block', fontSize: '11px', color: COLORS.text.muted, marginBottom: '3px' }
  });
  const patInput = createTextInput('password', 'ghp_...', syncConfig ? syncConfig.pat : '');

  const gistIdLabel = createElement('label', {
    textContent: t('ui.syncGistId'),
    style: { display: 'block', fontSize: '11px', color: COLORS.text.muted, marginBottom: '3px' }
  });
  const gistIdInput = createTextInput('text', 'abc123...', syncConfig ? syncConfig.gistId : '');

  const encryptionModeLabel = createElement('label', {
    textContent: t('ui.syncEncryptionMode'),
    style: { display: 'block', fontSize: '11px', color: COLORS.text.muted, marginBottom: '3px' }
  });

  const { encryptionModeSelect, encryptionPasswordRow, encryptionPasswordInput } = createEncryptionRow(syncConfig);

  const lastSyncedAt = syncConfig ? syncConfig.lastSyncedAt : null;
  const statusEl = createElement('div', {
    textContent: getStatusText(lastError, lastSyncedAt),
    style: {
      fontSize: '11px',
      color: getStatusColor(lastError),
      marginBottom: '8px'
    }
  });

  const saveBtn = createElement('button', {
    className: 'comic-helper-button',
    textContent: t('ui.syncSave'),
    events: {
      click: () => {
        const mode = encryptionModeSelect.value as 'none' | 'aes';
        if (mode === 'aes' && !encryptionPasswordInput.value.trim()) {
          statusEl.textContent = t('ui.syncEncryptionPasswordRequired');
          statusEl.style.color = '#ff6b6b';
          return;
        }
        const newConfig: SyncConfig = {
          enabled: enabledCheckbox.checked,
          pat: patInput.value.trim(),
          gistId: gistIdInput.value.trim(),
          lastSyncedAt: currentConfig ? currentConfig.lastSyncedAt : null,
          encryptionMode: mode,
          ...(mode === 'aes' ? { encryptionPassword: encryptionPasswordInput.value.trim() } : {})
        };
        currentConfig = newConfig;
        isFeedbackShown = true;
        (saveBtn as HTMLButtonElement).disabled = true;
        saveBtn.textContent = t('ui.syncSaving');

        onSave(newConfig).then(() => {
          statusEl.textContent = t('ui.syncSaveSuccess');
          statusEl.style.color = COLORS.text.success;
          setTimeout(() => {
            isFeedbackShown = false;
            statusEl.textContent = getStatusText(latestLastError, latestSyncConfig?.lastSyncedAt ?? null);
            statusEl.style.color = getStatusColor(latestLastError);
          }, 3000);
        }).catch((err: unknown) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          statusEl.textContent = t('ui.syncSaveError').replace('{error}', errMsg);
          statusEl.style.color = getStatusColor('error');
        }).finally(() => {
          (saveBtn as HTMLButtonElement).disabled = false;
          saveBtn.textContent = t('ui.syncSave');
        });
      }
    }
  });

  const titleEl = createElement('div', {
    textContent: t('ui.syncSettings'),
    style: {
      fontWeight: 'bold',
      fontSize: '13px',
      marginBottom: '10px',
      paddingTop: '10px',
      borderTop: `1px solid ${COLORS.border.default}`
    }
  });

  const container = createElement('div', {
    style: { padding: '0 2px' }
  }, [titleEl, enabledRow, patLabel, patInput, gistIdLabel, gistIdInput,
    encryptionModeLabel, encryptionModeSelect, encryptionPasswordRow,
    statusEl, saveBtn]);

  const updateEncryptionFields = (newSyncConfig: SyncConfig | null): void => {
    const mode = newSyncConfig ? newSyncConfig.encryptionMode : 'none';
    encryptionModeSelect.value = mode;
    encryptionPasswordInput.value = newSyncConfig ? (newSyncConfig.encryptionPassword ?? '') : '';
    encryptionPasswordRow.style.display = mode === 'aes' ? 'block' : 'none';
  };

  return {
    el: container,
    update: (newSyncConfig: SyncConfig | null, newLastError: string | null) => {
      latestSyncConfig = newSyncConfig;
      latestLastError = newLastError;
      currentConfig = newSyncConfig;
      enabledCheckbox.checked = newSyncConfig ? newSyncConfig.enabled : false;
      patInput.value = newSyncConfig ? newSyncConfig.pat : '';
      gistIdInput.value = newSyncConfig ? newSyncConfig.gistId : '';
      updateEncryptionFields(newSyncConfig);
      if (!isFeedbackShown) {
        const newLastSyncedAt = newSyncConfig ? newSyncConfig.lastSyncedAt : null;
        statusEl.textContent = getStatusText(newLastError, newLastSyncedAt);
        statusEl.style.color = getStatusColor(newLastError);
      }
    }
  };
}
