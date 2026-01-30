/**
 * Logic extracted from comic-viewer-helper.user.js for unit testing.
 */

const CONTAINER_SELECTOR = '#post-comic';

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

/**
 * Fit images to viewport
 */
export function fitImagesToViewport(alignmentIndex = -1, isDualViewEnabled = false) {
  const container = document.querySelector(CONTAINER_SELECTOR);
  if (!container) return;

  const originalImages = Array.from(container.querySelectorAll('img:not(.comic-row-wrapper img)'));
  // Note: This logic needs access to the cached originalImages if we want to avoid DOM re-querying complexity.
  // For now, focusing on the core calculation and layout application.
  
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  Object.assign(container.style, {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0', margin: '0', width: '100%', maxWidth: 'none'
  });

  const allImages = Array.from(container.querySelectorAll('img'));

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const isLandscape = img.naturalWidth > img.naturalHeight;
    
    let pairWithNext = false;
    if (isDualViewEnabled && !isLandscape && i + 1 < allImages.length) {
      const nextImg = allImages[i+1];
      const nextIsLandscape = nextImg.naturalWidth > nextImg.naturalHeight;
      const nextIsAlignmentTarget = (i + 1) === alignmentIndex;
      if (!nextIsLandscape && !nextIsAlignmentTarget) {
        pairWithNext = true;
      }
    }

    if (pairWithNext) {
      const nextImg = allImages[i+1];
      const row = document.createElement('div');
      row.className = 'comic-row-wrapper';
      Object.assign(row.style, {
        display: 'flex', flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center',
        width: '100vw', maxWidth: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)',
        height: '100vh', marginBottom: '0', position: 'relative', boxSizing: 'border-box'
      });

      [img, nextImg].forEach(im => {
        Object.assign(im.style, {
          maxWidth: '50%', maxHeight: '100%', width: 'auto', height: 'auto',
          objectFit: 'contain', margin: '0', display: 'block'
        });
      });

      row.appendChild(img); row.appendChild(nextImg);
      container.appendChild(row);
      i++;
    } else {
      img.style.cssText = ''; 
      Object.assign(img.style, {
        maxWidth: `${vw}px`, maxHeight: `${vh}px`, width: 'auto', height: 'auto',
        display: 'block', margin: '0 auto', flexShrink: '0', objectFit: 'contain'
      });
    }
  }
}