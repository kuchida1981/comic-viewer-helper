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

export interface SearchResultsState {
  results: SearchResult[];
  totalCount: string | null;
  nextPageUrl: string | null;
  pagination: PaginationItem[];
}

export interface SearchCache {
  query: string;
  results: SearchResultsState;
  fetchedAt: number;
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
