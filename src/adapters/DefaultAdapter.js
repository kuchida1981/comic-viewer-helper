/**
 * @typedef {Object} Metadata
 * @property {string} title
 * @property {Array<{text: string, href: string}>} tags
 * @property {Array<{title: string, href: string, thumb: string}>} relatedWorks
 */

/**
 * @typedef {Object} SiteAdapter
 * @property {function(string): boolean} match - URLが適合するか
 * @property {Object} selectors
 * @property {string} selectors.container - コンテナのセレクタ
 * @property {string} selectors.images - 画像のセレクタ
 * @property {function(): HTMLImageElement[]} [getImages] - 独自取得ロジック（任意）
 * @property {function(): Metadata} [getMetadata] - メタデータ抽出ロジック（任意）
 */

/**
 * Default adapter for the existing site structure
 * @type {SiteAdapter}
 */
export const DefaultAdapter = {
  // Always match as a fallback (should be checked last)
  match: () => true,
  selectors: {
    container: '#post-comic',
    images: '#post-comic img'
  },
  getMetadata: () => {
    const title = document.querySelector('h1')?.textContent?.trim() || 'Unknown Title';
    
    const tags = Array.from(document.querySelectorAll('#post-tag a')).map(a => ({
      text: a.textContent?.trim() || '',
      href: /** @type {HTMLAnchorElement} */ (a).href
    }));

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
