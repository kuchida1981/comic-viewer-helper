import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSyncSettings } from './SyncSettings.js';
import { SyncConfig } from '../../types.js';

describe('SyncSettings', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('createSyncSettings', () => {
    it('should render with null syncConfig', () => {
      const onSave = vi.fn();
      const comp = createSyncSettings({ syncConfig: null, onSave, lastError: null });

      expect(comp.el).toBeTruthy();
      const checkbox = comp.el.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      const inputs = comp.el.querySelectorAll('input[type="password"], input[type="text"]');
      expect(inputs).toHaveLength(2);
    });

    it('should render with existing syncConfig', () => {
      const config: SyncConfig = {
        enabled: true,
        pat: 'my-token',
        gistId: 'abc123',
        lastSyncedAt: null
      };
      const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn(), lastError: null });

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
        lastSyncedAt: new Date('2024-01-01').getTime()
      };
      const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn(), lastError: null });
      document.body.appendChild(comp.el);

      const statusEls = comp.el.querySelectorAll('div');
      const hasTimeText = Array.from(statusEls).some(el => {
        const text = el.textContent || '';
        return text.includes('2024') || text.includes('最終同期') || text.includes('Last synced');
      });
      expect(hasTimeText).toBe(true);
    });

    it('should show "never synced" when lastSyncedAt is null', () => {
      const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: null };
      const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn(), lastError: null });
      document.body.appendChild(comp.el);

      const allText = comp.el.textContent || '';
      expect(allText).toMatch(/Never synced|未同期/);
    });

    it('should show error message when lastError is set', () => {
      const comp = createSyncSettings({
        syncConfig: null,
        onSave: vi.fn(),
        lastError: 'Network error'
      });
      document.body.appendChild(comp.el);

      const allText = comp.el.textContent || '';
      expect(allText).toContain('Network error');
    });

    it('should call onSave with current form values when save button is clicked', () => {
      const onSave = vi.fn();
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
        lastSyncedAt: null
      });
    });

    it('should preserve lastSyncedAt from existing config when saving', () => {
      const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: 12345 };
      const onSave = vi.fn();
      const comp = createSyncSettings({ syncConfig: config, onSave, lastError: null });
      document.body.appendChild(comp.el);

      const saveBtn = comp.el.querySelector('button') as HTMLButtonElement;
      saveBtn.click();

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ lastSyncedAt: 12345 })
      );
    });

    it('should trim whitespace from PAT and gistId on save', () => {
      const onSave = vi.fn();
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

    describe('update', () => {
      it('should update displayed values with new syncConfig', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn(), lastError: null });
        document.body.appendChild(comp.el);

        const newConfig: SyncConfig = {
          enabled: true,
          pat: 'updated-token',
          gistId: 'updated-gist',
          lastSyncedAt: null
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
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn(), lastError: null });
        document.body.appendChild(comp.el);

        comp.update(null, 'Connection refused');

        const allText = comp.el.textContent || '';
        expect(allText).toContain('Connection refused');
      });

      it('should clear error and show sync time on update when no error', () => {
        const comp = createSyncSettings({ syncConfig: null, onSave: vi.fn(), lastError: 'old error' });
        document.body.appendChild(comp.el);

        const config: SyncConfig = { enabled: true, pat: 'p', gistId: 'g', lastSyncedAt: null };
        comp.update(config, null);

        const allText = comp.el.textContent || '';
        expect(allText).not.toContain('old error');
        expect(allText).toMatch(/Never synced|未同期/);
      });

      it('should handle null syncConfig on update', () => {
        const config: SyncConfig = { enabled: true, pat: 'token', gistId: 'gid', lastSyncedAt: null };
        const comp = createSyncSettings({ syncConfig: config, onSave: vi.fn(), lastError: null });
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
