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
}
