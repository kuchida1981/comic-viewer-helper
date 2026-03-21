import { Store, StoreState } from '../store';
import { SyncConfig, RelatedWork, HistoryEntry } from '../types';

export interface SyncProvider {
  upload(data: string, gistId: string): Promise<{ gistId: string }>;
  download(gistId: string): Promise<string | null>;
}

interface SyncPayloadHostData {
  favorites: RelatedWork[];
  luckyHistory: HistoryEntry[];
  searchHistory: string[];
  pinnedTags: string[];
}

interface SyncPayloadSettings {
  enabled: boolean;
  isDualViewEnabled: boolean;
  isAutoplayEnabled: boolean;
  autoplayInterval: number;
}

interface SyncPayload {
  version: 1;
  lastSyncedAt: number;
  settings?: SyncPayloadSettings;
  hosts?: Record<string, SyncPayloadHostData>;
}

const GIST_FILENAME = 'comic-viewer-helper-sync.json';

export class GistSyncProvider implements SyncProvider {
  constructor(private pat: string) {}

  upload(data: string, gistId: string): Promise<{ gistId: string }> {
    return new Promise((resolve, reject) => {
      const method = gistId ? 'PATCH' : 'POST';
      const url = gistId
        ? `https://api.github.com/gists/${gistId}`
        : 'https://api.github.com/gists';

      GM_xmlhttpRequest({
        method,
        url,
        headers: {
          'Authorization': `token ${this.pat}`,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          description: 'comic-viewer-helper sync data',
          public: false,
          files: {
            [GIST_FILENAME]: { content: data }
          }
        }),
        onload: (response) => {
          if (response.status >= 200 && response.status < 300) {
            try {
              const body = JSON.parse(response.responseText) as { id: string };
              resolve({ gistId: body.id });
            } catch {
              reject(new Error('Failed to parse upload response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${response.status}`));
          }
        },
        onerror: () => reject(new Error('Network error during upload'))
      });
    });
  }

  download(gistId: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `https://api.github.com/gists/${gistId}`,
        headers: {
          'Authorization': `token ${this.pat}`,
        },
        onload: (response) => {
          if (response.status === 404) {
            resolve(null);
            return;
          }
          if (response.status >= 200 && response.status < 300) {
            try {
              const body = JSON.parse(response.responseText) as {
                files: Record<string, { content: string }>;
              };
              const file = (body.files as Record<string, { content: string } | undefined>)[GIST_FILENAME];
              resolve(file ? file.content : null);
            } catch {
              reject(new Error('Failed to parse download response'));
            }
          } else {
            reject(new Error(`Download failed with status ${response.status}`));
          }
        },
        onerror: () => reject(new Error('Network error during download'))
      });
    });
  }
}

export class SyncManager {
  private provider: SyncProvider | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_DELAY = 30_000; // 30 seconds
  private lastError: string | null = null;

  constructor(private store: Store) {}

  setProvider(provider: SyncProvider | null): void {
    this.provider = provider;
  }

  scheduleUpload(): void {
    if (!this.provider) return;
    const config = this.store.getState().syncConfig;
    if (!config?.enabled) return;

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      void this._upload();
    }, this.DEBOUNCE_DELAY);
  }

  pull(): Promise<void> {
    if (!this.provider) return Promise.resolve();
    const config = this.store.getState().syncConfig;
    if (!config?.enabled || !config.gistId) return Promise.resolve();

    return this.provider.download(config.gistId)
      .then(data => {
        if (data) {
          this._applyRemoteData(data, config);
        } else {
          this.lastError = null;
        }
      })
      .catch((err: unknown) => {
        console.warn('[SyncManager] pull failed:', err);
        this.lastError = err instanceof Error ? err.message : String(err);
      });
  }

  getLastError(): string | null {
    return this.lastError;
  }

  private _upload(): Promise<void> {
    if (!this.provider) return Promise.resolve();
    const config = this.store.getState().syncConfig;
    if (!config?.enabled) return Promise.resolve();

    const state = this.store.getState();
    const host = window.location.hostname;
    const now = Date.now();

    const hostData: SyncPayloadHostData = {
      favorites: state.favorites,
      luckyHistory: state.luckyHistory,
      searchHistory: state.searchHistory,
      pinnedTags: state.pinnedTags,
    };

    const mergeAndUpload = async (): Promise<void> => {
      let existingHosts: Record<string, SyncPayloadHostData> = {};

      if (config.gistId) {
        try {
          const existing = await this.provider!.download(config.gistId);
          if (existing) {
            const existingPayload = JSON.parse(existing) as SyncPayload;
            existingHosts = existingPayload.hosts ?? {};
          }
        } catch {
          // Continue with upload even if merge fails
        }
      }

      const payload: SyncPayload = {
        version: 1,
        lastSyncedAt: now,
        settings: {
          enabled: state.enabled,
          isDualViewEnabled: state.isDualViewEnabled,
          isAutoplayEnabled: state.isAutoplayEnabled,
          autoplayInterval: state.autoplayInterval,
        },
        hosts: { ...existingHosts, [host]: hostData },
      };

      const result = await this.provider!.upload(JSON.stringify(payload), config.gistId);

      const latestConfig = this.store.getState().syncConfig;
      if (!latestConfig) return;

      const updatedConfig: SyncConfig = {
        ...latestConfig,
        gistId: result.gistId,
        lastSyncedAt: now,
      };
      this.store.setState({ syncConfig: updatedConfig });
      this.lastError = null;
    };

    return mergeAndUpload().catch((err: unknown) => {
      console.warn('[SyncManager] upload failed:', err);
      this.lastError = err instanceof Error ? err.message : String(err);
    });
  }

  private _applyRemoteData(data: string, config: SyncConfig): void {
    try {
      const payload = JSON.parse(data) as SyncPayload;
      const localLastSynced = config.lastSyncedAt ?? 0;

      if (payload.lastSyncedAt <= localLastSynced) return;

      const host = window.location.hostname;
      const hostData = payload.hosts?.[host];
      const patch: Partial<StoreState> = {};

      if (payload.settings) {
        patch.enabled = payload.settings.enabled;
        patch.isDualViewEnabled = payload.settings.isDualViewEnabled;
        patch.isAutoplayEnabled = payload.settings.isAutoplayEnabled;
        patch.autoplayInterval = payload.settings.autoplayInterval;
      }

      if (hostData) {
        patch.favorites = hostData.favorites;
        patch.luckyHistory = hostData.luckyHistory;
        patch.searchHistory = hostData.searchHistory;
        patch.pinnedTags = hostData.pinnedTags;
      }

      const updatedConfig: SyncConfig = { ...config, lastSyncedAt: payload.lastSyncedAt };
      patch.syncConfig = updatedConfig;

      this.store.setState(patch);
      this.lastError = null;
    } catch (err) {
      console.warn('[SyncManager] failed to apply remote data:', err);
      this.lastError = err instanceof Error ? err.message : String(err);
    }
  }
}
