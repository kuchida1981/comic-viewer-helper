import { Metadata, SearchCache } from './types';

export interface ImageInfo {
  isLandscape: boolean;
}

export interface Rect {
  top: number;
  bottom: number;
}

/**
 * Calculate visible height of an image in the viewport
 */
export function calculateVisibleHeight(rect: Rect, windowHeight: number): number {
  const visibleTop = Math.max(0, rect.top);
  const visibleBottom = Math.min(windowHeight, rect.bottom);
  return Math.max(0, visibleBottom - visibleTop);
}

/**
 * Determine if two images can be paired based on their properties
 */
export function shouldPairWithNext(current: ImageInfo, next: ImageInfo | null, isDualViewEnabled: boolean): boolean {
  if (!isDualViewEnabled) return false;
  if (current.isLandscape) return false;
  if (!next) return false;
  if (next.isLandscape) return false;

  return true;
}

/**
 * Get primary visible image index based on visible height and proximity to center
 */
export function getPrimaryVisibleImageIndex(imgs: (HTMLImageElement | { getBoundingClientRect: () => Rect })[], windowHeight: number): number {
  if (!imgs || !Array.isArray(imgs) || imgs.length === 0) return -1;

  let maxVisibleHeight = 0;
  let minDistanceToCenter = Infinity;
  let primaryIndex = -1;
  const viewportCenter = windowHeight / 2;

  imgs.forEach((img, index) => {
    // Safety check: skip if img is null/undefined or getBoundingClientRect is missing
    if (!img || typeof img.getBoundingClientRect !== 'function') {
      return;
    }

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
 */
export function getImageElementByIndex(imgs: HTMLImageElement[], index: number): HTMLImageElement | null {
  if (index < 0 || index >= imgs.length) return null;
  return imgs[index];
}

/**
 * Cleanup DOM: remove wrappers and reset image styles.
 * Returns the list of images in their current DOM order.
 */
export function cleanupDOM(container: HTMLElement): HTMLImageElement[] {
  if (!container) return [];

  const allImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  const wrappers = container.querySelectorAll('.comic-row-wrapper');

  wrappers.forEach(w => w.remove());

  allImages.forEach(img => {
    if (img && img.style) {
      img.style.cssText = '';
    }
  });

  return allImages;
}

/**
 * Fit images to viewport using DOM reconciliation to minimize layout thrashing
 */
export function fitImagesToViewport(container: HTMLElement, spreadOffset = 0, isDualViewEnabled = false): void {
  if (!container) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  Object.assign(container.style, {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0', margin: '0', width: '100%', maxWidth: 'none'
  });

  // 1. Get all images (whether inside wrappers or not)
  // Note: We use querySelectorAll to get current DOM order
  const allImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  
  // 2. Get existing wrappers for reuse
  const existingWrappers = Array.from(container.querySelectorAll<HTMLElement>('.comic-row-wrapper'));
  let wrapperIndex = 0;

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    
    // Safety check: skip invalid images
    if (!img || typeof img.naturalWidth !== 'number' || typeof img.naturalHeight !== 'number') {
      continue;
    }

    const isLandscape = img.naturalWidth > img.naturalHeight;

    let pairWithNext = false;
    let nextImg: HTMLImageElement | null = null;

    // Deterministic pairing logic based on spreadOffset
    const effectiveIndex = i - spreadOffset;
    const isPairingPosition = effectiveIndex >= 0 && effectiveIndex % 2 === 0;

    // EXCEPTIONS: First and last pages are always solo
    const isFirstPage = i === 0;
    const isNextLastPage = i + 1 === allImages.length - 1;

    if (isDualViewEnabled && isPairingPosition && i + 1 < allImages.length && !isFirstPage && !isNextLastPage) {
      const candidate = allImages[i + 1];
      
      // Safety check for next pairing candidate
      if (candidate && typeof candidate.naturalWidth === 'number' && typeof candidate.naturalHeight === 'number') {
        const nextIsLandscape = candidate.naturalWidth > candidate.naturalHeight;

        if (shouldPairWithNext({ isLandscape }, { isLandscape: nextIsLandscape }, isDualViewEnabled)) {
          pairWithNext = true;
          nextImg = candidate;
        }
      }
    }

    // 3. Reconciliation: reuse or create wrapper
    let wrapper = existingWrappers[wrapperIndex];

    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'comic-row-wrapper';
      container.appendChild(wrapper);
    } else {
      // Ensure wrapper is in correct DOM order by appending it again
      // (appendChild moves the node if it's already in the DOM)
      container.appendChild(wrapper);
    }

    Object.assign(wrapper.style, {
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      width: '100vw', maxWidth: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)',
      height: '100vh', marginBottom: '0', position: 'relative', boxSizing: 'border-box'
    });

    if (pairWithNext && nextImg) {
      wrapper.style.flexDirection = 'row-reverse';

      [img, nextImg].forEach(im => {
        Object.assign(im.style, {
          maxWidth: '50%', maxHeight: '100%', width: 'auto', height: 'auto',
          objectFit: 'contain', margin: '0', display: 'block'
        });
      });

      // Only update children if state is different to avoid layout thrashing
      if (wrapper.children[0] !== img || wrapper.children[1] !== nextImg || wrapper.children.length !== 2) {
        wrapper.replaceChildren(img, nextImg);
      }

      i++; // Skip next image
    } else {
      wrapper.style.flexDirection = 'row'; // Default
      
      Object.assign(img.style, {
        maxWidth: `${vw}px`, maxHeight: `${vh}px`, width: 'auto', height: 'auto',
        display: 'block', margin: '0 auto', flexShrink: '0', objectFit: 'contain'
      });

      if (wrapper.children.length !== 1 || wrapper.children[0] !== img) {
        wrapper.replaceChildren(img);
      }
    }
    
    wrapperIndex++;
  }

  // 4. Remove unused wrappers
  while (wrapperIndex < existingWrappers.length) {
    existingWrappers[wrapperIndex].remove();
    wrapperIndex++;
  }
}

/**
 * Revert changes: clear styles and restore original DOM structure
 */
export function revertToOriginal(originalImages: HTMLImageElement[], container: HTMLElement): void {
  if (!container) return;

  // Clear container styles
  if (container.style) {
    container.style.cssText = '';
  }

  if (!originalImages || !Array.isArray(originalImages)) return;

  // Remove wrappers and restore images
  originalImages.forEach(img => {
    if (img && img.style) {
      img.style.cssText = '';
    }
    // Only append if it's a node
    if (img instanceof Node) {
      container.appendChild(img);
    }
  });

  // Remove any remaining wrappers
  const wrappers = container.querySelectorAll('.comic-row-wrapper');
  wrappers.forEach(w => w.remove());
}

/**
 * Determine click navigation direction based on image position within a spread pair.
 * Returns 'next' for single images or the left-side image in a spread,
 * 'prev' for the right-side image in a spread.
 * Assumes right-to-left reading order (flexDirection: row-reverse).
 */
export function getClickNavigationDirection(img: HTMLImageElement): 'next' | 'prev' {
  const wrapper = img.parentElement;
  if (!wrapper || !wrapper.classList.contains('comic-row-wrapper')) {
    return 'next';
  }

  const siblings = Array.from(wrapper.querySelectorAll<HTMLImageElement>('img'));
  if (siblings.length < 2) {
    return 'next';
  }

  // flexDirection: row-reverse の場合、DOM の先頭要素が画面上の右側（prev方向）になる
  return img === siblings[0] ? 'prev' : 'next';
}

/**
 * Determine navigation direction from wheel event
 */
export function getNavigationDirection(event: WheelEvent, threshold = 50): 'next' | 'prev' | 'none' {
  if (Math.abs(event.deltaY) < threshold) {
    return 'none';
  }
  return event.deltaY > 0 ? 'next' : 'prev';
}

/**
 * Wait for an image to load or timeout
 */
export async function waitForImageLoad(img: HTMLImageElement, timeout = 5000): Promise<void> {
  if (!img) return Promise.resolve();

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
      if (img && typeof img.removeEventListener === 'function') {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      }
    };

    if (img && typeof img.addEventListener === 'function') {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    } else {
      // If addEventListener is missing, just resolve immediately to avoid hanging
      clearTimeout(timer);
      resolve();
    }
  });
}

/**
 * Force image to start loading by setting loading='eager' and trying to decode
 */
export function forceImageLoad(img: HTMLImageElement): void {
  if (!img) return;

  // If the image is lazy loaded, force it to be eager so the browser starts downloading immediately
  // even if it's off-screen (which it is during jump).
  if (typeof img.getAttribute === 'function' && img.getAttribute('loading') === 'lazy') {
    img.setAttribute('loading', 'eager');
  }

  // Trigger decode to hint the browser
  if ('decode' in img && typeof img.decode === 'function') {
    img.decode().catch(() => { });
  }
}

/**
 * Preload images around current index
 */
export function preloadImages(images: HTMLImageElement[], currentIndex: number, count = 3): void {
  if (!images || !Array.isArray(images) || images.length === 0) return;

  // Preload next images
  for (let i = 1; i <= count; i++) {
    const nextIndex = currentIndex + i;
    if (nextIndex < images.length) {
      const img = images[nextIndex];
      if (img && !img.complete) {
        img.loading = 'eager';
        // Use decode() to trigger decoding in the background
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().catch(() => { });
        }
      }
    }
  }

  // Optionally preload previous images (just one or two)
  for (let i = 1; i <= Math.min(count, 2); i++) {
    const prevIndex = currentIndex - i;
    if (prevIndex >= 0) {
      const img = images[prevIndex];
      if (img && !img.complete) {
        img.loading = 'eager';
        if ('decode' in img && typeof img.decode === 'function') {
          img.decode().catch(() => { });
        }
      }
    }
  }
}

/**
 * Select a random non-private work from related works and search cache, and jump to it
 */
export function jumpToRandomWork(metadata: Metadata, searchCache?: SearchCache | null): void {
  const sources: { href: string }[] = [];

  // 1. Related Works (filter private)
  if (metadata?.relatedWorks) {
    sources.push(...metadata.relatedWorks.filter(w => !w.isPrivate));
  }

  // 2. Search Cache Results
  if (searchCache?.results?.results) {
    sources.push(...searchCache.results.results);
  }

  if (sources.length === 0) return;

  // 3. Deduplicate by href
  const uniqueWorks = Array.from(
    new Map(sources.map(w => [w.href, w])).values()
  );

  const randomWork = uniqueWorks[Math.floor(Math.random() * uniqueWorks.length)];
  if (randomWork?.href) {
    window.location.href = randomWork.href;
  }
}
