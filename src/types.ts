export interface Tag {
  text: string;
  href: string;
  type: string | null;
}

export interface RelatedWork {
  title: string;
  href: string;
  thumb: string;
  isPrivate?: boolean;
}

export interface Metadata {
  title: string;
  tags: Tag[];
  relatedWorks: RelatedWork[];
}

export interface SearchResult {
  title: string;
  href: string;
  thumb: string;
}

export interface PaginationItem {
  label: string;
  url: string | null;
  isCurrent: boolean;
  type: 'page' | 'prev' | 'next' | 'extend';
}

export interface SearchContext {
  type: 'keyword' | 'tag' | 'genre' | 'artist';
  label?: string;
}

export interface SearchResultsState {
  results: SearchResult[];
  totalCount: string | null;
  nextPageUrl: string | null;
  pagination: PaginationItem[];
  searchContext?: SearchContext;
}

export interface SearchCache {
  query: string;
  results: SearchResultsState;
  fetchedAt: number;
  context?: SearchContext;
}

export interface SearchConfig {
  baseUrl: string;
  queryParam: string;
}

export interface SiteAdapter {
  match: (url: string) => boolean;
  getContainer: () => HTMLElement | null;
  getImages: () => HTMLImageElement[];
  getMetadata?: () => Metadata;
  getSearchUrl?: (query: string) => string;
  searchConfig?: SearchConfig;
  parseSearchResults?: (doc: Document) => SearchResultsState;
}

/**
 * Interface for adapters that support search functionality
 */
export interface SearchableAdapter extends SiteAdapter {
  getSearchUrl: (query: string) => string;
  parseSearchResults: (doc: Document) => SearchResultsState;
}

/**
 * Interface for adapters that support metadata extraction
 */
export interface MetadataAdapter extends SiteAdapter {
  getMetadata: () => Metadata;
}

/**
 * Type guard for SearchableAdapter
 */
export function isSearchableAdapter(adapter: SiteAdapter): adapter is SearchableAdapter {
  return typeof adapter.getSearchUrl === 'function' && typeof adapter.parseSearchResults === 'function';
}

/**
 * Type guard for MetadataAdapter
 */
export function isMetadataAdapter(adapter: SiteAdapter): adapter is MetadataAdapter {
  return typeof adapter.getMetadata === 'function';
}
