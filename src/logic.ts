import { Metadata } from './types';

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
  const allImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  const wrappers = container.querySelectorAll('.comic-row-wrapper');

  wrappers.forEach(w => w.remove());

  allImages.forEach(img => {
    img.style.cssText = '';
  });

  return allImages;
}

/**
 * Fit images to viewport
 */
export function fitImagesToViewport(container: HTMLElement, spreadOffset = 0, isDualViewEnabled = false): void {
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

    // EXCEPTIONS: First and last pages are always solo
    const isFirstPage = i === 0;
    const isNextLastPage = i + 1 === allImages.length - 1;

    if (isDualViewEnabled && isPairingPosition && i + 1 < allImages.length && !isFirstPage && !isNextLastPage) {
      const nextImg = allImages[i + 1];
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
      const nextImg = allImages[i + 1];
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
 */
export function revertToOriginal(originalImages: HTMLImageElement[], container: HTMLElement): void {
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
 */
export function forceImageLoad(img: HTMLImageElement): void {
  // If the image is lazy loaded, force it to be eager so the browser starts downloading immediately
  // even if it's off-screen (which it is during jump).
  if (img.getAttribute('loading') === 'lazy') {
    img.setAttribute('loading', 'eager');
  }

  // Trigger decode to hint the browser
  if ('decode' in img) {
    img.decode().catch(() => { });
  }
}

/**
 * Preload images around current index
 */
export function preloadImages(images: HTMLImageElement[], currentIndex: number, count = 3): void {
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
      if (!img.complete) {
        img.loading = 'eager';
        if ('decode' in img) {
          img.decode().catch(() => { });
        }
      }
    }
  }
}

/**
 * Select a random non-private work from related works and jump to it
 */
export function jumpToRandomWork(metadata: Metadata): void {
  if (!metadata?.relatedWorks) return;
  const works = metadata.relatedWorks.filter(w => !w.isPrivate);
  const randomWork = works[Math.floor(Math.random() * works.length)];
  if (randomWork?.href) {
    window.location.href = randomWork.href;
  }
}
