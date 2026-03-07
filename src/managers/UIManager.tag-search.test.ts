import { Store, StoreState } from '../store';
import { SiteAdapter, Tag } from '../types';
import { Navigator } from './Navigator';
import { UIManager } from './UIManager';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

describe('UIManager Tag Search', () => {
    let adapter: SiteAdapter;
    let store: Store;
    let navigator: Navigator;
    let uiManager: UIManager;

    beforeEach(() => {
        adapter = {
            match: vi.fn().mockReturnValue(true),
            getContainer: vi.fn(),
            getImages: vi.fn().mockReturnValue([]),
            getMetadata: vi.fn(),
            getSearchUrl: vi.fn(),
            parseSearchResults: vi.fn()
        };

        const defaultState: StoreState = {
            enabled: true,
            metadata: { title: '', tags: [], relatedWorks: [] },
            isMetadataModalOpen: true,
            isHelpModalOpen: false,
            isSearchModalOpen: false,
            isFavoritesModalOpen: false,
            searchQuery: '',
            searchHistory: [],
            searchContext: undefined,
            isDualViewEnabled: false,
            spreadOffset: 0,
            currentVisibleIndex: 0,
            guiPos: null,
            isLoading: false,
            isLuckyLoading: false,
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

        (store.getState as Mock).mockImplementation(() => {
            const state = (store.getState as Mock).mock.results[0]?.value || defaultState;
            const lastCall = (store.setState as Mock).mock.calls.at(-1);
            if (lastCall) {
                return { ...state, ...lastCall[0] };
            }
            return state;
        });

        navigator = { getImages: vi.fn().mockReturnValue([]) } as unknown as Navigator;
        const discoveryManager = {
            performSearch: vi.fn(),
            contextsMatch: vi.fn().mockImplementation((c1, c2) => c1?.type === c2?.type && c1?.label === c2?.label)
        } as any;

        uiManager = new UIManager(adapter, store, navigator, discoveryManager);

        vi.stubGlobal('document', {
            getElementById: vi.fn().mockReturnValue(null),
            body: { appendChild: vi.fn() },
            documentElement: { classList: { toggle: vi.fn() } },
            createElement: vi.fn()
        });
    });

    it('should open search modal when a tag is clicked', async () => {
        const tag: Tag = { text: 'Test Artist', href: '/artist/test', type: 'artist' };
        // Access private _handleTagClick through any
        await (uiManager as any)._handleTagClick(tag);

        expect(store.setState).toHaveBeenCalledWith({
            isMetadataModalOpen: false,
            isSearchModalOpen: true,
            searchResults: null
        });

        const discoveryManager = (uiManager as any).discoveryManager;
        expect(discoveryManager.performSearch).toHaveBeenCalledWith(tag.href, false, {
            type: 'artist',
            label: tag.text
        });
    });

    it('should use "tag" type for non-artist/genre tags', async () => {
        const tag: Tag = { text: 'Test Tag', href: '/tag/test', type: 'character' };
        await (uiManager as any)._handleTagClick(tag);

        const discoveryManager = (uiManager as any).discoveryManager;
        expect(discoveryManager.performSearch).toHaveBeenCalledWith(tag.href, false, {
            type: 'tag',
            label: tag.text
        });
    });
});
