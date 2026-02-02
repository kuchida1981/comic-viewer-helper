/**
 * @typedef {Object} Metadata
 * @property {string} title
 * @property {Array<{text: string, href: string, type: string | null}>} tags
 * @property {Array<{title: string, href: string, thumb: string}>} relatedWorks
 */

/**
 * @typedef {Object} SiteAdapter
 * @property {function(string): boolean} match - URLが適合するか
 * @property {function(): HTMLElement | null} getContainer - コンテナ要素の取得
 * @property {function(): HTMLImageElement[]} getImages - 画像要素リストの取得
 * @property {function(): Metadata} [getMetadata] - メタデータ抽出ロジック（任意）
 */

const CONTAINER_SELECTOR = '#post-comic';
const TAG_TYPES = ['artist', 'character', 'circle', 'fanzine', 'genre', 'magazine', 'parody'];

/**
 * タグのURLパスからタグ種別を判定する
 * @param {string} href - タグのリンクURL
 * @returns {string | null} タグ種別（artist, character, circle, fanzine, genre, magazine, parody）またはnull
 */
function getTagType(href) {
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
 * @type {SiteAdapter}
 */
export const DefaultAdapter = {
  // Always match as a fallback (should be checked last)
  match: () => true,
  getContainer: () => /** @type {HTMLElement | null} */ (document.querySelector(CONTAINER_SELECTOR)),
  getImages: () => /** @type {HTMLImageElement[]} */ (
    Array.from(document.querySelectorAll(`${CONTAINER_SELECTOR} img`))
  ),
  getMetadata: () => {
    const title = document.querySelector('h1')?.textContent?.trim() || 'Unknown Title';
    
    const tags = Array.from(document.querySelectorAll('#post-tag a')).map(a => {
      const href = /** @type {HTMLAnchorElement} */ (a).href;
      return {
        text: a.textContent?.trim() || '',
        href,
        type: getTagType(href)
      };
    });

    const relatedWorks = Array.from(document.querySelectorAll('.post-list-image')).map(el => {
      const anchor = el.closest('a');
      const img = el.querySelector('img');
      // Assuming title is in a span inside or near .post-list-image based on issue description
      const titleEl = el.querySelector('span') || anchor?.querySelector('span');
      
      return {
        title: titleEl?.textContent?.trim() || 'Untitled',
        href: anchor?.href || '',
        thumb: img?.src || ''
      };
    });

    return { title, tags, relatedWorks };
  }
};
