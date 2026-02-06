import { vi } from 'vitest';
import { Store, StoreState } from '../../store.js';

const DEFAULT_STATE: StoreState = {
  enabled: true,
  isDualViewEnabled: false,
  spreadOffset: 0,
  currentVisibleIndex: 0,
  guiPos: null,
  metadata: { title: '', tags: [], relatedWorks: [] },
  isMetadataModalOpen: false,
  isHelpModalOpen: false,
  isSearchModalOpen: false,
  isLoading: false,
  searchResults: null,
  searchQuery: '',
  searchCache: null,
  searchHistory: [],
};

/**
 * Pattern B: Store モック
 * 戻り値にモック参照を同伴する
 */
export function createMockStore(override: Partial<StoreState> = {}) {
  const state: StoreState = { ...DEFAULT_STATE, ...override };
  const getState = vi.fn(() => state);
  const setState = vi.fn();
  const subscribe = vi.fn();
  const store = { getState, setState, subscribe } as unknown as Store;
  return { store, getState, setState, subscribe };
}