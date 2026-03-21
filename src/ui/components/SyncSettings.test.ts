import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSyncSettings } from './SyncSettings.js';
import { SyncConfig } from '../../types.js';

describe('SyncSettings', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createSyncSettings', () => {
    it('should render with null syncConfig', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });

      expect(comp.el).toBeTruthy();
      const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      const inputs = comp.el.querySelectorAll('input[type="password"], input[type="text"]');
      // PAT (password) + GistId (text) + EncryptionPassword (password, hidden)
      expect(inputs).toHaveLength(3);
    });

    it('should render with existing syncConfig', () => {
      const config: SyncConfig = {
        enabled: true,
        pat: 'my-token',
        gistId: 'abc123',
        lastSyncedAt: null,
        encryptionMode: 'none'
      };
      const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });

      const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      const patInput = comp.el.querySelector('input[type="password"]') as HTMLInputElement;
      expect(patInput.value).toBe('my-token');

      const gistInput = comp.el.querySelector('input[type="text"]') as HTMLInputElement;
      expect(gistInput.value).toBe('abc123');
    });

    it('should show lastSyncedAt time in status', () => {
      const config: SyncConfig = {
        enabled: true,
        pat: 'token',
        gistId: 'gid',
        lastSyncedAt: new Date('2024-01-01').getTime(),
        encryptionMode: 'none'
      };
      const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
      document.body.appendChild(comp.el);

      const statusEls = comp.el.querySelectorAll('div');
      const hasTimeText = Array.from(statusEls).some(el => {
        const text = el.textContent || '';
        return text.includes('2024') || text.includes('最終同期') || text.includes('Last synced');
      });
      expect(hasTimeText).toBe(true);
    });

    it('should show "never synced" when lastSyncedAt is null', () => {
      const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' };
      const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
      document.body.appendChild(comp.el);

      const allText = comp.el.textContent || '';
      expect(allText).toMatch(/Never synced|未同期/);
    });

    it('should show error message when lastError is set', () => {
      const comp = createSyncSettings({
        syncConfig: null,
        onSave: vi.fn().mockResolvedValue(undefined),
        lastError: 'Network error'
      });
      document.body.appendChild(comp.el);

      const allText = comp.el.textContent || '';
      expect(allText).toContain('Network error');
    });

    it('should call onSave with current form values when save button is clicked', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
      document.body.appendChild(comp.el);

      const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      checkbox.checked = true;

      const patInput = comp.el.querySelector('input[type="password"]') as HTMLInputElement;
      patInput.value = 'new-token';

      const gistInput = comp.el.querySelector('input[type="text"]') as HTMLInputElement;
      gistInput.value = 'new-gist-id';

      const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
      saveBtn.click();

      expect(onSave).toHaveBeenCalledWith({
        enabled: true,
        pat: 'new-token',
        gistId: 'new-gist-id',
        lastSyncedAt: null,
        encryptionMode: 'none'
      });
    });

    it('should preserve lastSyncedAt from existing config when saving', () => {
      const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: 12345, encryptionMode: 'none' };
      const onSave = vi.fn().mockResolvedValue(undefined);
      const comp = createSyncSettings({ syncConfig: config, onSave, lastError: null });
      document.body.appendChild(comp.el);

      const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
      saveBtn.click();

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ lastSyncedAt: 12345 })
      );
    });

    it('should trim whitespace from PAT and gistId on save', () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
      document.body.appendChild(comp.el);

      const patInput = comp.el.querySelector('input[type="password"]') as HTMLInputElement;
      patInput.value = '  token  ';

      const gistInput = comp.el.querySelector('input[type="text"]') as HTMLInputElement;
      gistInput.value = '  gist-id  ';

      const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
      saveBtn.click();

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ pat: 'token', gistId: 'gist-id' })
      );
    });

    describe('async save feedback', () => {
      it('should disable save button and show saving text while onSave is pending', async () => {
        let resolveSave!: () => void;
        const onSave = vi.fn().mockReturnValue(new Promise<void>(resolve => { resolveSave = resolve; }));
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        expect(saveBtn.disabled).toBe(true);
        expect(saveBtn.textContent).toMatch(/Saving|保存中/);

        resolveSave();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      it('should show success message and re-enable button when onSave resolves', async () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        await new Promise(resolve => setTimeout(resolve, 0));

        const allText = comp.el.textContent || '';
        expect(allText).toMatch(/Saved|保存しました/);
        expect(saveBtn.disabled).toBe(false);
        expect(saveBtn.textContent).toMatch(/^Save$|^保存$/);
      });

      it('should show error message and re-enable button when onSave rejects', async () => {
        const onSave = vi.fn().mockRejectedValue(new Error('Auth failed'));
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        await new Promise(resolve => setTimeout(resolve, 0));

        const allText = comp.el.textContent || '';
        expect(allText).toContain('Auth failed');
        expect(saveBtn.disabled).toBe(false);
      });

      it('should not allow update() to overwrite error message after onSave rejects', async () => {
        const onSave = vi.fn().mockRejectedValue(new Error('Auth failed'));
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        await new Promise(resolve => setTimeout(resolve, 0));

        // Background sync error should not overwrite the save error
        const config = { enabled: true, pat: 'p', gistId: 'g', lastSyncedAt: null, encryptionMode: 'none' as const };
        comp.update(config, 'background sync error');

        const allText = comp.el.textContent || '';
        expect(allText).toContain('Auth failed');
        expect(allText).not.toContain('background sync error');
      });

      it('should not update status text from update() while feedback is shown', async () => {
        let resolveSave!: () => void;
        const onSave = vi.fn().mockReturnValue(new Promise<void>(resolve => { resolveSave = resolve; }));
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        // While saving, calling update() should not override the "Saving..." state
        const config = { enabled: true, pat: 'p', gistId: 'g', lastSyncedAt: null, encryptionMode: 'none' as const };
        comp.update(config, null);

        expect(saveBtn.textContent).toMatch(/Saving|保存中/);

        resolveSave();
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      it('should restore status text after 3 seconds following save success', async () => {
        vi.useFakeTimers();
        const onSave = vi.fn().mockResolvedValue(undefined);
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();
        await vi.runAllTimersAsync();

        const allText = comp.el.textContent || '';
        expect(allText).toMatch(/Never synced|未同期/);
        vi.useRealTimers();
      });

      it('should show password required error when AES mode is selected but password is empty', () => {
        const onSave = vi.fn();
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const encryptionSelect = comp.el.querySelector('select') as HTMLSelectElement;
        encryptionSelect.value = 'aes';
        encryptionSelect.dispatchEvent(new Event('change'));

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        expect(onSave).not.toHaveBeenCalled();
        const allText = comp.el.textContent || '';
        expect(allText).toMatch(/password|パスワード/i);
      });

      it('should call onSave with encryptionPassword when AES mode is selected', () => {
        const onSave = vi.fn().mockResolvedValue(undefined);
        const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });
        document.body.appendChild(comp.el);

        const encryptionSelect = comp.el.querySelector('select') as HTMLSelectElement;
        encryptionSelect.value = 'aes';
        encryptionSelect.dispatchEvent(new Event('change'));

        const passwordInputs = comp.el.querySelectorAll('input[type="password"]') as NodeListOf<HTMLInputElement>;
        // Second password input is the encryption password
        passwordInputs[1].value = 'my-secret';

        const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
        saveBtn.click();

        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({ encryptionMode: 'aes', encryptionPassword: 'my-secret' })
        );
      });
    });

    describe('description texts', () => {
      it('should render intro description text', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
        document.body.appendChild(comp.el);

        const descEls = comp.el.querySelectorAll('.comic-helper-sync-description');
        expect(descEls.length).toBeGreaterThan(0);
      });

      it('should render PAT description text', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
        document.body.appendChild(comp.el);

        const allText = comp.el.textContent || '';
        expect(allText).toMatch(/gist|Gist/);
      });

      it('should render encryption password description inside password row', () => {
        const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'aes', encryptionPassword: 'pass' };
        const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
        document.body.appendChild(comp.el);

        const encryptionSelect = comp.el.querySelector('select') as HTMLSelectElement;
        encryptionSelect.value = 'aes';
        encryptionSelect.dispatchEvent(new Event('change'));

        const allText = comp.el.textContent || '';
        expect(allText).toMatch(/password|パスワード/i);
      });
    });

    describe('update', () => {
      it('should update displayed values with new syncConfig', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
        document.body.appendChild(comp.el);

        const newConfig: SyncConfig = {
          enabled: true,
          pat: 'updated-token',
          gistId: 'updated-gist',
          lastSyncedAt: null,
          encryptionMode: 'none'
        };
        comp.update(newConfig, null);

        const patInput = comp.el.querySelector('input[type="password"]') as HTMLInputElement;
        expect(patInput.value).toBe('updated-token');

        const gistInput = comp.el.querySelector('input[type="text"]') as HTMLInputElement;
        expect(gistInput.value).toBe('updated-gist');

        const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);
      });

      it('should show error message on update when lastError is provided', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
        document.body.appendChild(comp.el);

        comp.update(null, 'Connection refused');

        const allText = comp.el.textContent || '';
        expect(allText).toContain('Connection refused');
      });

      it('should clear error and show sync time on update when no error', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn().mockResolvedValue(undefined), lastError: 'old error' });
        document.body.appendChild(comp.el);

        const config: SyncConfig = { enabled: true, pat: 'p', gistId: 'g', lastSyncedAt: null, encryptionMode: 'none' };
        comp.update(config, null);

        const allText = comp.el.textContent || '';
        expect(allText).not.toContain('old error');
        expect(allText).toMatch(/Never synced|未同期/);
      });

      it('should handle null syncConfig on update', () => {
        const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' };
        const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn().mockResolvedValue(undefined), lastError: null });
        document.body.appendChild(comp.el);

        comp.update(null, null);

        const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        const patInput = comp.el.querySelector('input[type="password"]') as HTMLInputElement;
        expect(patInput.value).toBe('');
      });
    });
  });
});
