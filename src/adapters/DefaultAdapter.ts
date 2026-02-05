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
  getSearchUrl: function (query: string) {
    const url = new URL(this.searchConfig?.baseUrl || '/', window.location.origin);
    url.searchParams.set(this.searchConfig?.queryParam || 's', query);
    return url.toString();
  },
  getMetadata: (): Metadata => {
    const title = document.querySelector('h1')?.textContent?.trim() || 'Unknown Title';

    const tags = Array.from(document.querySelectorAll<HTMLAnchorElement>('#post-tag a')).map(a => {
      const href = a.href;
      return {
        text: a.textContent?.trim() || '',
        href,
        type: getTagType(href)
      };
    });

    const relatedWorks = Array.from(document.querySelectorAll<HTMLElement>('.post-list-image')).map(el => {
      const anchor = el.closest('a');
      const img = el.querySelector('img');
      // Assuming title is in a span inside or near .post-list-image based on issue description
      const titleEl = el.querySelector('span') || anchor?.querySelector('span');

      const title = titleEl?.textContent?.trim() || 'Untitled';
      return {
        title,
        href: anchor?.href || '',
        thumb: img?.src || '',
        isPrivate: title.startsWith('非公開')
      };
    });

    return { title, tags, relatedWorks };
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

    const totalCount = doc.querySelector<HTMLElement>('div.page-h > span')?.textContent?.trim() || null;
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
            url: el.getAttribute('href') || null,
            isCurrent,
            type
          });
        }
      });
    }

    return { results, totalCount, nextPageUrl, pagination };
  }
};
