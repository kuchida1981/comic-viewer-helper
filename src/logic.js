/**
 * Logic extracted from comic-viewer-helper.user.js for unit testing.
 */

/**
 * Calculate visible height of an image in the viewport
 * @param {DOMRect} rect 
 * @param {number} windowHeight 
 * @returns {number}
 */
export function calculateVisibleHeight(rect, windowHeight) {
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(windowHeight, rect.bottom);
  return Math.max(0, visibleBottom - visibleTop);
}

/**
 * Determine if two images should be paired in dual view
 * @param {Object} current - { isLandscape, index }
 * @param {Object} next - { isLandscape, index }
 * @param {Object} options - { isDualViewEnabled, alignmentIndex }
 * @returns {boolean}
 */
export function shouldPairWithNext(current, next, options) {
  const { isDualViewEnabled, alignmentIndex } = options;
  
  if (!isDualViewEnabled) return false;
  if (current.isLandscape) return false;
  if (!next) return false;
  if (next.isLandscape) return false;
  
  // If the next image is the alignment target, do not pair
  if (next.index === alignmentIndex) return false;
  
  return true;
}

/**
 * Get primary visible image index based on visible height
 * @param {Array<{getBoundingClientRect: Function}>} imgs 
 * @param {number} windowHeight 
 * @returns {number}
 */
export function getPrimaryVisibleImageIndex(imgs, windowHeight) {
  if (imgs.length === 0) return -1;

  let maxVisibleHeight = 0;
  let primaryIndex = -1;

  imgs.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const visibleHeight = calculateVisibleHeight(rect, windowHeight);

    if (visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      primaryIndex = index;
    }
  });

  return primaryIndex;
}
