import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncManager, SyncProvider } from './SyncManager.js';
import { Store } from '../store.js';
import { setupGMStorageMock } from '../test/mocks/gm_storage.js';

describe('SyncManager <-> Store integration', () => {
  let store: Store;
  let syncManager: SyncManager;
  let mockProvider: SyncProvider;

  beforeEach(() => {
    setupGMStorageMock();
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);
    vi.stubGlobal('GM_xmlhttpRequest', vi.fn());

    store = new Store();
    syncManager = new SyncManager(store);

    mockProvider = {
      upload: vi.fn().mockResolvedValue({ gistId: 'test-gist-id' }),
      download: vi.fn().mockResolvedValue(null)
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('Store._syncTrigger integration', () => {
    it('should call scheduleUpload when syncable state changes via setSyncTrigger', () => {
      const scheduleSpy = vi.spyOn(syncManager, 'scheduleUpload');
      store.setSyncTrigger(() => syncManager.scheduleUpload());
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null }
      });

      store.setState({ favorites: [{ title: 'T', href: '/t', thumb: '/i' }] });

      expect(scheduleSpy).toHaveBeenCalled();
    });

    it('should not call scheduleUpload when only syncConfig changes', () => {
      vi.useFakeTimers();
      const scheduleSpy = vi.spyOn(syncManager, 'scheduleUpload');
      store.setSyncTrigger(() => syncManager.scheduleUpload());

      // Changing syncConfig should NOT trigger sync
      store.setState({
        syncConfig: { enabled: true, pat: 'new-pat', gistId: 'gid', lastSyncedAt: null }
      });

      expect(scheduleSpy).not.toHaveBeenCalled();
    });

    it('should persist syncConfig to GM storage when setState is called', () => {
      const testConfig = { enabled: true, pat: 'secret', gistId: 'abc123', lastSyncedAt: null };
      store.setState({ syncConfig: testConfig });

      const newStore = new Store();
      const loadedConfig = newStore.getState().syncConfig;
      expect(loadedConfig).toEqual(testConfig);
    });

    it('should load syncConfig from GM storage on Store initialization', () => {
      const testConfig = { enabled: true, pat: 'loaded-pat', gistId: 'loaded-gist', lastSyncedAt: 1234567890 };
      store.setState({ syncConfig: testConfig });

      const newStore = new Store();
      expect(newStore.getState().syncConfig).toEqual(testConfig);
    });
  });

  describe('pull and Store state integration', () => {
    it('should update Store state after successful pull', () => {
      syncManager.setProvider(mockProvider);
      const now = Date.now();
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null }
      });

      const remotePayload = JSON.stringify({
        version: 1,
        lastSyncedAt: now,
        settings: {
          enabled: true,
          isDualViewEnabled: false,
          isAutoplayEnabled: true,
          autoplayInterval: 3
        },
        hosts: {
          'localhost': {
            favorites: [],
            luckyHistory: [],
            searchHistory: ['test-search'],
            pinnedTags: []
          }
        }
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(remotePayload);

      return syncManager.pull().then(() => {
        const state = store.getState();
        expect(state.isAutoplayEnabled).toBe(true);
        expect(state.autoplayInterval).toBe(3);
        expect(state.searchHistory).toEqual(['test-search']);
        expect(state.syncConfig?.lastSyncedAt).toBe(now);
      });
    });

    it('should clear lastError after successful pull', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null }
      });

      // First cause an error
      (mockProvider.download as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('fail'));

      return syncManager.pull().then(() => {
        expect(syncManager.getLastError()).toBe('fail');

        // Now succeed
        (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        return syncManager.pull();
      }).then(() => {
        expect(syncManager.getLastError()).toBeNull();
      });
    });
  });
});
