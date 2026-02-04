import { SiteAdapter, Metadata } from '../types';

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
  }
};
