/**
 * Logic extracted from comic-viewer-helper.user.js for unit testing.
 */

/**
 * @typedef {Object} ImageInfo
 * @property {boolean} isLandscape
 */

/**
 * Calculate visible height of an image in the viewport
 * @param {DOMRect | {top: number, bottom: number}} rect 
 * @param {number} windowHeight 
 * @returns {number}
 */
export function calculateVisibleHeight(rect, windowHeight) {
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(windowHeight, rect.bottom);
  return Math.max(0, visibleBottom - visibleTop);
}

/**
 * Determine if two images can be paired based on their properties
 * @param {ImageInfo} current
 * @param {ImageInfo | null} next
 * @param {boolean} isDualViewEnabled
 * @returns {boolean}
 */
export function shouldPairWithNext(current, next, isDualViewEnabled) {
  if (!isDualViewEnabled) return false;
  if (current.isLandscape) return false;
  if (!next) return false;
  if (next.isLandscape) return false;
  
  return true;
}

/**
 * Get primary visible image index based on visible height
 * @param {Array<HTMLImageElement | {getBoundingClientRect: () => (DOMRect | {top: number, bottom: number})}>} imgs 
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
 * Get image element by index (0-based)
 * @param {Array<HTMLImageElement>} imgs 
 * @param {number} index 
 * @returns {HTMLImageElement|null}
 */
export function getImageElementByIndex(imgs, index) {
  if (index < 0 || index >= imgs.length) return null;
  return imgs[index];
}

/**
 * Cleanup DOM: remove wrappers and reset image styles.
 * Returns the list of images in their current DOM order.
 * @param {HTMLElement} container
 * @returns {Array<HTMLImageElement>}
 */
export function cleanupDOM(container) {
  const allImages = /** @type {HTMLImageElement[]} */ (Array.from(container.querySelectorAll('img')));
  const wrappers = container.querySelectorAll('.comic-row-wrapper');
  
  wrappers.forEach(w => w.remove());
  
  allImages.forEach(img => {
    img.style.cssText = '';
  });
  
  return allImages;
}

/**
 * Fit images to viewport
 * @param {string} containerSelector
 * @param {number} spreadOffset
 * @param {boolean} isDualViewEnabled
 */
export function fitImagesToViewport(containerSelector, spreadOffset = 0, isDualViewEnabled = false) {
  const container = /** @type {HTMLElement | null} */ (document.querySelector(containerSelector));
  if (!container) return;

  // Cleanup first and get images
  const allImages = cleanupDOM(container);

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  Object.assign(container.style, {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0', margin: '0', width: '100%', maxWidth: 'none'
  });

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const isLandscape = img.naturalWidth > img.naturalHeight;
    
    let pairWithNext = false;
    
    // Deterministic pairing logic based on spreadOffset
    // We pair (i, i+1) only if:
    // 1. Dual View is enabled
    // 2. Current position allows pairing: (i - spreadOffset) is even
    // 3. Image properties allow pairing (both portrait)
    
    const effectiveIndex = i - spreadOffset;
    const isPairingPosition = effectiveIndex >= 0 && effectiveIndex % 2 === 0;

    if (isDualViewEnabled && isPairingPosition && i + 1 < allImages.length) {
      const nextImg = allImages[i+1];
      const nextIsLandscape = nextImg.naturalWidth > nextImg.naturalHeight;
      
      if (shouldPairWithNext({ isLandscape }, { isLandscape: nextIsLandscape }, isDualViewEnabled)) {
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
      container.appendChild(img);
    }
  }
}

/**
 * Revert changes: clear styles and restore original DOM structure
 * @param {Array<HTMLImageElement>} originalImages 
 * @param {string} containerSelector 
 */
export function revertToOriginal(originalImages, containerSelector) {
  const container = /** @type {HTMLElement | null} */ (document.querySelector(containerSelector));
  if (!container) return;

  // Clear container styles
  container.style.cssText = '';

  // Remove wrappers and restore images
  originalImages.forEach(img => {
    img.style.cssText = '';
    container.appendChild(img);
  });

  // Remove any remaining wrappers
  const wrappers = container.querySelectorAll('.comic-row-wrapper');
  wrappers.forEach(w => w.remove());
}

/**
 * Determine navigation direction from wheel event
 * @param {WheelEvent} event 
 * @param {number} threshold 
 * @returns {'next' | 'prev' | 'none'}
 */
export function getNavigationDirection(event, threshold = 50) {
  if (Math.abs(event.deltaY) < threshold) {
    return 'none';
  }
  return event.deltaY > 0 ? 'next' : 'prev';
}
