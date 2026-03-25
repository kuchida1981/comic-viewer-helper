import { SiteAdapter, Metadata, SearchResultsState, PaginationItem } from '../types';

const CONTAINER_SELECTOR = '#post-comic';
const TAG_TYPES = ['artist', 'character', 'circle', 'fanzine', 'genre', 'magazine', 'parody'];

/**
 * タグのURLパスからタグ種別を判定する
 * @param {string} href - タグのリンクURL
 * @returns {string | null} タグ種別（artist, character, circle, fanzine, genre, magazine, parody）またはnull
 */
function getTagType(href: string): string | null {
  try {
    const url = new URL(href);
    const pathname = url.pathname;
    for (const type of TAG_TYPES) {
      if (pathname.startsWith(`/${type}/`)) {
        return type;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Parse metadata (title, tags, relatedWorks) from a given Document.
 * Can be used on the current page document or a fetched/parsed document.
 */
export function parseMetadataFromDocument(doc: Document): Metadata {
  const titleEl = doc.querySelector('h1');
  const title = titleEl?.textContent?.trim() || 'Unknown Title';

  const tags = Array.from(doc.querySelectorAll<HTMLAnchorElement>('#post-tag a')).map(a => {
    const href = a.href;
    return {
      text: a.textContent?.trim() || '',
      href,
      type: getTagType(href)
    };
  });

  const relatedWorks = Array.from(doc.querySelectorAll<HTMLElement>('.post-list-image')).map(el => {
    const anchor = el.closest('a');
    const img = el.querySelector('img');
    const spanEl = el.querySelector('span') || anchor?.querySelector('span');
    const workTitle = spanEl?.textContent?.trim() || 'Untitled';
    return {
      title: workTitle,
      href: anchor?.href || '',
      thumb: img?.src || '',
      isPrivate: workTitle.startsWith('非公開')
    };
  });

  return { title, tags, relatedWorks };
}

/**
 * Default adapter for the existing site structure
 */
export const DefaultAdapter: SiteAdapter = {
  // Always match as a fallback (should be checked last)
  match: () => true,
  getContainer: () => document.querySelector<HTMLElement>(CONTAINER_SELECTOR),
  getImages: () =>
    Array.from(document.querySelectorAll<HTMLImageElement>(`${CONTAINER_SELECTOR} img`)),
  searchConfig: {
    baseUrl: '/',
    queryParam: 's'
  },
  getSearchUrl: function (this: typeof DefaultAdapter, query: string) {
    const config = this.searchConfig;
    if (!config) return '';
    const url = new URL(config.baseUrl, window.location.origin);
    url.searchParams.set(config.queryParam, query);
    return url.toString();
  },
  getMetadata: (): Metadata => {
    return parseMetadataFromDocument(document);
  },
  parseSearchResults: (doc: Document): SearchResultsState => {
    const results = Array.from(doc.querySelectorAll<HTMLAnchorElement>('div.post-list > a')).map(a => {
      const img = a.querySelector<HTMLImageElement>('.post-list-image img');
      const titleEl = a.querySelector<HTMLSpanElement>(':scope > span');
      return {
        title: titleEl?.textContent?.trim() || '',
        href: a.getAttribute('href') || '',
        thumb: img?.getAttribute('src') || ''
      };
    });

    const totalCountEl = doc.querySelector<HTMLElement>('div.page-h > span');
    const totalCount = totalCountEl?.textContent?.trim() || null;
    const nextPageUrl = doc.querySelector<HTMLAnchorElement>('div.wp-pagenavi a.nextpostslink')?.getAttribute('href') || null;

    const pagination: PaginationItem[] = [];
    const pagenavi = doc.querySelector('.wp-pagenavi');
    if (pagenavi) {
      pagenavi.childNodes.forEach(node => {
        if (node.nodeType === 1) { // Node.ELEMENT_NODE
          const el = node as HTMLElement;
          if (el.classList.contains('pages')) return;

          const isCurrent = el.classList.contains('current');
          const isNext = el.classList.contains('nextpostslink');
          const isPrev = el.classList.contains('previouspostslink');
          const isExtend = el.classList.contains('extend');

          let type: 'page' | 'prev' | 'next' | 'extend' = 'page';
          if (isNext) type = 'next';
          else if (isPrev) type = 'prev';
          else if (isExtend) type = 'extend';

          pagination.push({
            label: el.textContent?.trim() || '',
            url: el.getAttribute('href'),
            isCurrent,
            type
          });
        }
      });
    }

    return { results, totalCount, nextPageUrl, pagination };
  }
};
