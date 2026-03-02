import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { UIManager } from './UIManager';
import { Store, StoreState } from '../store';
import { Navigator } from './Navigator';
import { DefaultAdapter } from '../adapters/DefaultAdapter';
import { createMetadataModal } from '../ui/components/MetadataModal';
import { createSearchModal } from '../ui/components/SearchModal';
import { Tag } from '../types';

// Helper Interfaces
interface ModalProps { onClose: () => void; }
interface MetadataModalProps extends ModalProps {
  onTagClick: (tag: Tag) => Promise<void>;
}
interface SearchModalProps extends ModalProps {
  onSearch: (q: string, context?: unknown) => Promise<void>;
}

// Mock dependencies
vi.mock('../ui/styles.js', () => ({ injectStyles: vi.fn() }));
vi.mock('../ui/utils.js', () => ({ 
  createElement: vi.fn().mockReturnValue({ style: {}, appendChild: vi.fn(), querySelectorAll: vi.fn().mockReturnValue([]) })
}));
vi.mock('../ui/components/MetadataModal.js', () => ({
  createMetadataModal: vi.fn((_props: MetadataModalProps) => ({ el: { style: {}, remove: vi.fn() }, update: vi.fn() }))
}));
vi.mock('../ui/components/SearchModal.js', () => ({
  createSearchModal: vi.fn((_props: SearchModalProps) => ({ 
    el: { style: {}, remove: vi.fn() }, 
    input: {}, 
    updateResults: vi.fn(), 
    setUpdating: vi.fn() 
  }))
}));
// Mock other components to avoid errors
vi.mock('../ui/components/PowerButton.js', () => ({ createPowerButton: vi.fn(() => ({ el: {}, update: vi.fn() })) }));
vi.mock('../ui/components/PageCounter.js', () => ({ createPageCounter: vi.fn(() => ({ el: { style: {} }, update: vi.fn() })) }));
vi.mock('../ui/components/SpreadControls.js', () => ({ createSpreadControls: vi.fn(() => ({ el: { style: {} }, update: vi.fn() })) }));
vi.mock('../ui/components/NavigationButtons.js', () => ({ 
  createNavigationButtons: vi.fn(() => ({ elements: [], update: vi.fn() })) 
}));
vi.mock('../ui/components/ProgressBar.js', () => ({ createProgressBar: vi.fn(() => ({ el: { style: {} }, update: vi.fn() })) }));
vi.mock('../ui/components/LoadingIndicator.js', () => ({ createLoadingIndicator: vi.fn(() => ({ el: {}, update: vi.fn() })) }));
vi.mock('../ui/Draggable.js', () => ({ Draggable: vi.fn() }));

describe('UIManager - Internal Tag Search', () => {
  let adapter: typeof DefaultAdapter;
  let store: Store;
  let navigator: Navigator;
  let uiManager: UIManager;

  beforeEach(() => {
    adapter = { 
      match: vi.fn().mockReturnValue(true),
      getSearchUrl: vi.fn().mockReturnValue('http://search.com'),
      parseSearchResults: vi.fn().mockReturnValue({ results: [] })
    } as unknown as typeof DefaultAdapter;
    
    const defaultState: StoreState = {
      enabled: true, 
      metadata: { title: '', tags: [], relatedWorks: [] },
      isMetadataModalOpen: true, // Start with modal open
      isSearchModalOpen: false,
      searchQuery: '',
      searchHistory: [],
      searchContext: undefined,
      isDualViewEnabled: false,
      spreadOffset: 0,
      currentVisibleIndex: 0,
      guiPos: null,
      isHelpModalOpen: false,
      isLoading: false,
      searchResults: null,
      searchCache: null,
      luckyHistory: [],
      favorites: [],
      isAutoplayEnabled: false,
      autoplayInterval: 5
    };

    store = {
      getState: vi.fn().mockReturnValue(defaultState),
      setState: vi.fn(),
      subscribe: vi.fn()
    } as unknown as Store;

    // Partial state mock
    (store.getState as Mock).mockImplementation(() => {
        const calls = (store.setState as Mock).mock.calls;
        let currentState = { ...defaultState };
        calls.forEach(call => {
            currentState = { ...currentState, ...(call[0] as Partial<StoreState>) };
        });
        return currentState;
    });
    
    navigator = { getImages: vi.fn().mockReturnValue([]) } as unknown as Navigator;
    uiManager = new UIManager(adapter, store, navigator);

    vi.stubGlobal('document', {
        getElementById: vi.fn().mockReturnValue(null),
        body: { appendChild: vi.fn() },
        documentElement: { classList: { toggle: vi.fn() } },
        createElement: vi.fn()
    });
    vi.stubGlobal('window', { addEventListener: vi.fn(), innerWidth: 1000, innerHeight: 1000, fetch: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('should trigger internal search with context when tag is clicked', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('<html></html>') });
    vi.stubGlobal('fetch', fetchMock);

    uiManager.updateUI();

    // Verify MetadataModal created with onTagClick
    expect(createMetadataModal).toHaveBeenCalled();
    const createMetadataModalMock = createMetadataModal as unknown as Mock<(props: MetadataModalProps) => { el: { style: object; remove: Mock }; update: Mock }>;
    const props = createMetadataModalMock.mock.calls[0][0];
    expect(props.onTagClick).toBeDefined();

    // Simulate tag click
    const tag: Tag = { text: 'Test Tag', href: 'http://site.com/tags/test', type: 'tag' };
    await props.onTagClick(tag);

    // Verify UI state updates
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({ 
        isMetadataModalOpen: false, 
        isSearchModalOpen: true 
    }));

    // Perform Search verification
    // fetch should be called with tag href
    expect(fetchMock).toHaveBeenCalledWith('http://site.com/tags/test');
    
    // Check if searchContext was set in store
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'tag', label: 'Test Tag' }
    }));
    
    // Check context update
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'tag', label: 'Test Tag' }
    }));
    
    // Check that searchQuery was NOT updated
    const setStateMock = store.setState as unknown as Mock<(patch: Partial<StoreState>) => void>;
    const searchQueryCalls = setStateMock.mock.calls.filter((call: [Partial<StoreState>]) => 'searchQuery' in call[0]);
    expect(searchQueryCalls).toHaveLength(0);

    // Check history NOT updated for tag search
    // We can't easily check private _updateSearchHistory, but we can check store state if mock worked fully
    // Or check if setState was called with searchHistory.
    // Since our partial mock accumulates state, let's check calls.
    const historyUpdateCalls = setStateMock.mock.calls.filter((c: [Partial<StoreState>]) => !!c[0].searchHistory);
    expect(historyUpdateCalls.length).toBe(0);
  });

  it('should handle genre type correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('') });
    vi.stubGlobal('fetch', fetchMock);
    uiManager.updateUI();

    const createMetadataModalMock = createMetadataModal as unknown as Mock<(props: MetadataModalProps) => { el: { style: object; remove: Mock }; update: Mock }>;
    const props = createMetadataModalMock.mock.calls[0][0];
    const tag: Tag = { text: 'Action', href: 'http://site.com/genre/action', type: 'genre' };
    await props.onTagClick(tag);

    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'genre', label: 'Action' }
    }));
  });

  it('should handle artist type correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('') });
    vi.stubGlobal('fetch', fetchMock);
    uiManager.updateUI();

    const createMetadataModalMock = createMetadataModal as unknown as Mock<(props: MetadataModalProps) => { el: { style: object; remove: Mock }; update: Mock }>;
    const props = createMetadataModalMock.mock.calls[0][0];
    const tag: Tag = { text: 'Artist Name', href: 'http://site.com/artist/name', type: 'artist' };
    await props.onTagClick(tag);

    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'artist', label: 'Artist Name' }
    }));
  });

  it('should handle mixed search scenarios (keyword vs tag) and history updates', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: vi.fn().mockResolvedValue('<html></html>') });
    vi.stubGlobal('fetch', fetchMock);
    uiManager.updateUI();

    // 1. Tag Search
    const createMetadataModalMock = createMetadataModal as unknown as Mock<(props: MetadataModalProps) => { el: { style: object; remove: Mock }; update: Mock }>;
    const props = createMetadataModalMock.mock.calls[0][0];
    const tag: Tag = { text: 'Tag1', href: 'http://site.com/tags/tag1', type: 'tag' };
    await props.onTagClick(tag);

    // Verify context updated
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'tag', label: 'Tag1' }
    }));

    // searchQuery should not be updated for tags
    const setStateMock = store.setState as unknown as Mock<(patch: Partial<StoreState>) => void>;
    const tagSearchQueryCalls = setStateMock.mock.calls.filter((call: [Partial<StoreState>]) => 'searchQuery' in call[0]);
    expect(tagSearchQueryCalls).toHaveLength(0);
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'tag', label: 'Tag1' }
    }));

    // Check history NOT updated (check calls to setState with searchHistory)
    const historyCallsAfterTag = setStateMock.mock.calls.filter((c: [Partial<StoreState>]) => !!c[0].searchHistory);
    expect(historyCallsAfterTag.length).toBe(0);


    // 2. Keyword Search
    // Trigger updateUI to create SearchModal (since store.subscribe is mocked but not functional)
    uiManager.updateUI();

    // Trigger onSearch from SearchModal
    // Need to get SearchModal component mock
    const createSearchModalMock = createSearchModal as unknown as Mock<(props: SearchModalProps) => { el: { style: object; remove: Mock }; input: object; updateResults: Mock; setUpdating: Mock }>;
    const searchModalProps = createSearchModalMock.mock.calls[0][0];
    
    // Perform keyword search
    await searchModalProps.onSearch('keyword1');
    await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); await Promise.resolve();

    // Verify context updated to keyword
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchQuery: 'keyword1'
    }));
    expect(store.setState).toHaveBeenCalledWith(expect.objectContaining({
        searchContext: { type: 'keyword', label: 'keyword1' }
    }));

    // Check history IS updated
    const historyCallsAfterKeyword = setStateMock.mock.calls.filter((c: [Partial<StoreState>]) => !!c[0].searchHistory);
    expect(historyCallsAfterKeyword.length).toBeGreaterThan(0);
    const lastHistoryCall = historyCallsAfterKeyword[historyCallsAfterKeyword.length - 1];
    expect(lastHistoryCall[0].searchHistory).toContain('keyword1');
  });
});
