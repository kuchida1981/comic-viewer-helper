/**
 * @typedef {Object} SiteAdapter
 * @property {function(string): boolean} match - URLが適合するか
 * @property {Object} selectors
 * @property {string} selectors.container - コンテナのセレクタ
 * @property {string} selectors.images - 画像のセレクタ
 * @property {function(): HTMLImageElement[]} [getImages] - 独自取得ロジック（任意）
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
  }
};
