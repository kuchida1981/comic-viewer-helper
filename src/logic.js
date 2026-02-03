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
 * Get primary visible image index based on visible height and proximity to center
 * @param {Array<HTMLImageElement | {getBoundingClientRect: () => (DOMRect | {top: number, bottom: number})}>} imgs 
 * @param {number} windowHeight 
 * @returns {number}
 */
export function getPrimaryVisibleImageIndex(imgs, windowHeight) {
  if (imgs.length === 0) return -1;

  let maxVisibleHeight = 0;
  let minDistanceToCenter = Infinity;
  let primaryIndex = -1;
  const viewportCenter = windowHeight / 2;

  imgs.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const visibleHeight = calculateVisibleHeight(rect, windowHeight);

    if (visibleHeight > 0) {
      const elementCenter = (rect.top + rect.bottom) / 2;
      const distanceToCenter = Math.abs(viewportCenter - elementCenter);

      // Prefer element with more visible height, 
      // or if height is same, the one closer to the center of the viewport
      if (visibleHeight > maxVisibleHeight || (visibleHeight === maxVisibleHeight && distanceToCenter < minDistanceToCenter)) {
        maxVisibleHeight = visibleHeight;
        minDistanceToCenter = distanceToCenter;
        primaryIndex = index;
      }
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
 * @param {HTMLElement} container
 * @param {number} spreadOffset
 * @param {boolean} isDualViewEnabled
 */
export function fitImagesToViewport(container, spreadOffset = 0, isDualViewEnabled = false) {
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
    const effectiveIndex = i - spreadOffset;
    const isPairingPosition = effectiveIndex >= 0 && effectiveIndex % 2 === 0;

    if (isDualViewEnabled && isPairingPosition && i + 1 < allImages.length) {
      const nextImg = allImages[i+1];
      const nextIsLandscape = nextImg.naturalWidth > nextImg.naturalHeight;
      
      if (shouldPairWithNext({ isLandscape }, { isLandscape: nextIsLandscape }, isDualViewEnabled)) {
        pairWithNext = true;
      }
    }

    const row = document.createElement('div');
    row.className = 'comic-row-wrapper';
    Object.assign(row.style, {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      width: '100vw', maxWidth: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)',
      height: '100vh', marginBottom: '0', position: 'relative', boxSizing: 'border-box'
    });

    if (pairWithNext) {
      const nextImg = allImages[i+1];
      row.style.flexDirection = 'row-reverse';

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
      Object.assign(img.style, {
        maxWidth: `${vw}px`, maxHeight: `${vh}px`, width: 'auto', height: 'auto',
        display: 'block', margin: '0 auto', flexShrink: '0', objectFit: 'contain'
      });
      row.appendChild(img);
      container.appendChild(row);
    }
  }
}

/**
 * Revert changes: clear styles and restore original DOM structure
 * @param {Array<HTMLImageElement>} originalImages 
 * @param {HTMLElement} container 
 */
export function revertToOriginal(originalImages, container) {
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

/**
 * Wait for an image to load or timeout
 * @param {HTMLImageElement} img 
 * @param {number} timeout 
 * @returns {Promise<void>}
 */
export async function waitForImageLoad(img, timeout = 5000) {
  if (img.complete && img.naturalHeight !== 0) {
    return;
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, timeout);

    const onLoad = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      resolve();
    };

    const cleanup = () => {
      clearTimeout(timer);
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  });
}

/**
 * Force image to start loading by setting loading='eager' and trying to decode
 * @param {HTMLImageElement} img
 */
export function forceImageLoad(img) {
  // If the image is lazy loaded, force it to be eager so the browser starts downloading immediately
  // even if it's off-screen (which it is during jump).
  if (img.getAttribute('loading') === 'lazy') {
    img.setAttribute('loading', 'eager');
  }

  // Trigger decode to hint the browser
  if ('decode' in img) {
    img.decode().catch(() => {});
  }
}

/**
 * Preload images around current index
 * @param {HTMLImageElement[]} images 
 * @param {number} currentIndex 
 * @param {number} count 
 */
export function preloadImages(images, currentIndex, count = 3) {
  if (images.length === 0) return;

  // Preload next images
  for (let i = 1; i <= count; i++) {
    const nextIndex = currentIndex + i;
    if (nextIndex < images.length) {
      const img = images[nextIndex];
      if (!img.complete) {
        img.loading = 'eager';
        // Use decode() to trigger decoding in the background
        if ('decode' in img) {
          img.decode().catch(() => {});
        }
      }
    }
  }

  // Optionally preload previous images (just one or two)
  for (let i = 1; i <= Math.min(count, 2); i++) {
    const prevIndex = currentIndex - i;
    if (prevIndex >= 0) {
      const img = images[prevIndex];
      if (!img.complete) {
        img.loading = 'eager';
        if ('decode' in img) {
          img.decode().catch(() => {});
        }
      }
    }
  }
}

