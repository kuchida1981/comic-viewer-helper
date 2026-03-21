import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { SyncManager, GistSyncProvider, SyncProvider } from './SyncManager.js';
import { Store } from '../store.js';
import { setupGMStorageMock } from '../test/mocks/gm_storage.js';

describe('GistSyncProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('GM_xmlhttpRequest', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('upload', () => {
    it('should POST to create a new Gist when gistId is empty', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onload({ status: 201, responseText: JSON.stringify({ id: 'new-gist-id' }) });
      });

      return provider.upload('{"test":1}', '').then(result => {
        expect(result.gistId).toBe('new-gist-id');
        expect(requestMock).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'POST', url: 'https://api.github.com/gists' })
        );
      });
    });

    it('should PATCH to update an existing Gist when gistId is provided', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onload({ status: 200, responseText: JSON.stringify({ id: 'existing-id' }) });
      });

      return provider.upload('{"test":1}', 'existing-id').then(result => {
        expect(result.gistId).toBe('existing-id');
        expect(requestMock).toHaveBeenCalledWith(
          expect.objectContaining({ method: 'PATCH', url: 'https://api.github.com/gists/existing-id' })
        );
      });
    });

    it('should reject on HTTP error status', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onload({ status: 401, responseText: '{"message":"Bad credentials"}' });
      });

      return expect(provider.upload('{}', '')).rejects.toThrow('Upload failed with status 401');
    });

    it('should reject on network error', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onerror({});
      });

      return expect(provider.upload('{}', '')).rejects.toThrow('Network error during upload');
    });

    it('should include Authorization header with PAT', () => {
      const provider = new GistSyncProvider('my-secret-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onload({ status: 201, responseText: JSON.stringify({ id: 'gid' }) });
      });

      return provider.upload('{}', '').then(() => {
        expect(requestMock).toHaveBeenCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({ 'Authorization': 'token my-secret-pat' })
          })
        );
      });
    });
  });

  describe('download', () => {
    it('should return file content on success', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);
      const content = '{"version":1,"lastSyncedAt":1000}';

      requestMock.mockImplementation((details) => {
        (details as any).onload({
          status: 200,
          responseText: JSON.stringify({
            files: { 'comic-viewer-helper-sync.json': { content } }
          })
        });
      });

      return provider.download('gist-id').then(result => {
        expect(result).toBe(content);
      });
    });

    it('should return null when Gist is not found (404)', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onload({ status: 404, responseText: '{"message":"Not Found"}' });
      });

      return provider.download('missing-id').then(result => {
        expect(result).toBeNull();
      });
    });

    it('should return null when file is not in Gist', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onload({
          status: 200,
          responseText: JSON.stringify({ files: {} })
        });
      });

      return provider.download('gist-id').then(result => {
        expect(result).toBeNull();
      });
    });

    it('should reject on network error', () => {
      const provider = new GistSyncProvider('test-pat');
      const requestMock = vi.mocked(GM_xmlhttpRequest);

      requestMock.mockImplementation((details) => {
        (details as any).onerror({});
      });

      return expect(provider.download('gist-id')).rejects.toThrow('Network error during download');
    });
  });
});

describe('SyncManager', () => {
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

  describe('scheduleUpload', () => {
    it('should not schedule upload if provider is not set', () => {
      vi.useFakeTimers();
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      syncManager.scheduleUpload();
      vi.runAllTimers();

      expect(mockProvider.upload).not.toHaveBeenCalled();
    });

    it('should not schedule upload if sync is disabled', () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: false, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      syncManager.scheduleUpload();
      vi.runAllTimers();

      expect(mockProvider.upload).not.toHaveBeenCalled();
    });

    it('should schedule debounced upload when sync is enabled', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      expect(mockProvider.upload).toHaveBeenCalled();
    });

    it('should debounce multiple rapid calls', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      syncManager.scheduleUpload();
      syncManager.scheduleUpload();
      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      expect(mockProvider.upload).toHaveBeenCalledTimes(1);
    });
  });

  describe('_upload (via scheduleUpload)', () => {
    it('should merge existing gist data with local data', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'existing-gist', lastSyncedAt: null, encryptionMode: 'none' }
      });

      const existingPayload = JSON.stringify({
        version: 1,
        lastSyncedAt: 1000,
        settings: { enabled: true, isDualViewEnabled: false, isAutoplayEnabled: false, autoplayInterval: 5 },
        hosts: {
          'other-host.com': { favorites: [], luckyHistory: [], searchHistory: [], pinnedTags: [] }
        }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(existingPayload);

      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      expect(mockProvider.upload).toHaveBeenCalled();
      const uploadedData = JSON.parse((mockProvider.upload as ReturnType<typeof vi.fn>).mock.calls[0][0]);
      expect(uploadedData.hosts['other-host.com']).toBeDefined();
      expect(uploadedData.hosts['localhost']).toBeDefined();
    });

    it('should update syncConfig with returned gistId after upload', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: '', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockProvider.upload as ReturnType<typeof vi.fn>).mockResolvedValue({ gistId: 'brand-new-gist' });

      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      expect(store.getState().syncConfig?.gistId).toBe('brand-new-gist');
      expect(syncManager.getLastError()).toBeNull();
    });

    it('should handle upload failure gracefully', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockProvider.upload as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Upload failed'));

      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      expect(syncManager.getLastError()).toBe('Upload failed');
    });

    it('should return early if syncConfig becomes null before upload completes', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockProvider.upload as Mock).mockImplementation((): Promise<{ gistId: string }> => {
        store.setState({ syncConfig: null });
        return Promise.resolve({ gistId: 'gid' });
      });

      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      // Should not throw, just return early
      expect(store.getState().syncConfig).toBeNull();
    });

    it('should abort upload when download fails during merge to prevent data loss', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Download failed'));

      syncManager.scheduleUpload();
      await vi.runAllTimersAsync();

      // Upload must NOT proceed to avoid overwriting other devices' data
      expect(mockProvider.upload).not.toHaveBeenCalled();
      expect(syncManager.getLastError()).toBe('Download failed');
    });
  });

  describe('pull', () => {
    it('should return early if provider is not set', () => {
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      return syncManager.pull().then(() => {
        expect(mockProvider.download).not.toHaveBeenCalled();
      });
    });

    it('should return early if sync is disabled', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: false, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      return syncManager.pull().then(() => {
        expect(mockProvider.download).not.toHaveBeenCalled();
      });
    });

    it('should return early if gistId is empty', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: '', lastSyncedAt: null, encryptionMode: 'none' }
      });

      return syncManager.pull().then(() => {
        expect(mockProvider.download).not.toHaveBeenCalled();
      });
    });

    it('should download and apply remote data when remote is newer', () => {
      syncManager.setProvider(mockProvider);
      const now = Date.now();
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: 0, encryptionMode: 'none' }
      });

      const remoteData = JSON.stringify({
        version: 1,
        lastSyncedAt: now,
        settings: {
          enabled: true,
          isDualViewEnabled: true,
          isAutoplayEnabled: false,
          autoplayInterval: 10
        },
        hosts: {
          'localhost': {
            favorites: [{ title: 'Test', href: '/test', thumb: '/img' }],
            luckyHistory: [],
            searchHistory: ['keyword'],
            pinnedTags: ['tag1']
          }
        }
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(remoteData);

      return syncManager.pull().then(() => {
        const state = store.getState();
        expect(state.isDualViewEnabled).toBe(true);
        expect(state.autoplayInterval).toBe(10);
        expect(state.favorites).toHaveLength(1);
        expect(state.searchHistory).toEqual(['keyword']);
        expect(state.pinnedTags).toEqual(['tag1']);
        expect(state.syncConfig?.lastSyncedAt).toBe(now);
      });
    });

    it('should not apply remote data when remote is older', () => {
      syncManager.setProvider(mockProvider);
      const recentTime = Date.now();
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: recentTime, encryptionMode: 'none' }
      });

      const remoteData = JSON.stringify({
        version: 1,
        lastSyncedAt: recentTime - 1000, // older than local
        settings: { enabled: false, isDualViewEnabled: true, isAutoplayEnabled: false, autoplayInterval: 1 },
        hosts: {}
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(remoteData);
      const originalState = store.getState();

      return syncManager.pull().then(() => {
        const state = store.getState();
        expect(state.isDualViewEnabled).toBe(originalState.isDualViewEnabled);
      });
    });

    it('should store error message on failure', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      return syncManager.pull().then(() => {
        expect(syncManager.getLastError()).toBe('Network error');
      });
    });

    it('should handle invalid JSON from download gracefully', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue('not-valid-json');

      return syncManager.pull().then(() => {
        expect(syncManager.getLastError()).toBeTruthy();
      });
    });

    it('should handle non-Error thrown from download', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockRejectedValue('string error');

      return syncManager.pull().then(() => {
        expect(syncManager.getLastError()).toBe('string error');
      });
    });

    it('should apply settings even when no host-specific data exists', () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      const remoteData = JSON.stringify({
        version: 1,
        lastSyncedAt: Date.now() + 1000,
        settings: {
          enabled: true,
          isDualViewEnabled: true,
          isAutoplayEnabled: false,
          autoplayInterval: 7
        },
        hosts: {} // no host data for current host
      });

      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(remoteData);

      return syncManager.pull().then(() => {
        const state = store.getState();
        expect(state.isDualViewEnabled).toBe(true);
        expect(state.autoplayInterval).toBe(7);
      });
    });
  });

  describe('push', () => {
    it('should return early if provider is not set', async () => {
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      await syncManager.push();
      expect(mockProvider.upload).not.toHaveBeenCalled();
    });

    it('should return early if sync is disabled', async () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: false, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      await syncManager.push();
      expect(mockProvider.upload).not.toHaveBeenCalled();
    });

    it('should upload immediately without debounce', async () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await syncManager.push();

      expect(mockProvider.upload).toHaveBeenCalledTimes(1);
    });

    it('should cancel pending debounce timer and upload immediately', async () => {
      vi.useFakeTimers();
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      syncManager.scheduleUpload(); // starts debounce timer
      await syncManager.push();     // should cancel timer and upload immediately

      expect(mockProvider.upload).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });

    it('should resolve and update syncConfig on success', async () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: '', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockProvider.upload as ReturnType<typeof vi.fn>).mockResolvedValue({ gistId: 'new-gist-id' });

      await syncManager.push();

      expect(store.getState().syncConfig?.gistId).toBe('new-gist-id');
      expect(syncManager.getLastError()).toBeNull();
    });

    it('should reject and propagate error on failure', async () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockProvider.upload as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Auth failed'));

      await expect(syncManager.push()).rejects.toThrow('Auth failed');
    });

    it('should not update syncLastError in store on failure', async () => {
      syncManager.setProvider(mockProvider);
      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' },
        syncLastError: null
      });
      (mockProvider.download as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (mockProvider.upload as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Push error'));

      await expect(syncManager.push()).rejects.toThrow('Push error');
      expect(store.getState().syncLastError).toBeNull();
    });
  });

  describe('setProvider', () => {
    it('should allow setting provider to null', () => {
      syncManager.setProvider(mockProvider);
      syncManager.setProvider(null);

      store.setState({
        syncConfig: { enabled: true, pat: 'pat', gistId: 'gid', lastSyncedAt: null, encryptionMode: 'none' }
      });

      return syncManager.pull().then(() => {
        expect(mockProvider.download).not.toHaveBeenCalled();
      });
    });
  });
});
