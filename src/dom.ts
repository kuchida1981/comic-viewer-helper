import { isEligibleForPairing, shouldPairWithNext } from './logic';

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
export function cleanupDOM(container: HTMLElement | null | undefined): HTMLImageElement[] {
  if (!container) return [];

  const allImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  const wrappers = container.querySelectorAll('.comic-row-wrapper');

  wrappers.forEach(w => w.remove());

  allImages.forEach(img => {
    if (img.style as CSSStyleDeclaration | undefined) {
      img.style.cssText = '';
    }
  });

  return allImages;
}

/**
 * Determine if an image pair should be formed at current index
 */
function getPairingInfo(
  allImages: HTMLImageElement[],
  i: number,
  spreadOffset: number,
  isDualViewEnabled: boolean
): { pairWithNext: boolean; nextImg: HTMLImageElement | null } {
  if (!isDualViewEnabled || !isEligibleForPairing(i, allImages.length, spreadOffset)) {
    return { pairWithNext: false, nextImg: null };
  }

  const img = allImages[i];
  const candidate: HTMLImageElement | undefined = allImages[i + 1];

  if (
    typeof (img as { naturalWidth?: unknown }).naturalWidth === 'number' &&
    typeof (candidate as { naturalWidth?: unknown } | undefined)?.naturalWidth === 'number'
  ) {
    const isLandscape = img.naturalWidth > img.naturalHeight;
    const nextIsLandscape = candidate.naturalWidth > candidate.naturalHeight;

    if (shouldPairWithNext({ isLandscape }, { isLandscape: nextIsLandscape }, isDualViewEnabled)) {
      return { pairWithNext: true, nextImg: candidate };
    }
  }

  return { pairWithNext: false, nextImg: null };
}

/**
 * Apply layout styles to a single row (wrapper)
 */
function applyRowLayout(
  wrapper: HTMLElement,
  img: HTMLImageElement,
  nextImg: HTMLImageElement | null,
  viewport: { vw: number; vh: number }
): void {
  Object.assign(wrapper.style, {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    width: '100vw', maxWidth: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)',
    height: '100vh', marginBottom: '0', position: 'relative', boxSizing: 'border-box'
  });

  if (nextImg) {
    wrapper.style.flexDirection = 'row-reverse';
    [img, nextImg].forEach(im => {
      Object.assign(im.style, {
        maxWidth: '50%', maxHeight: '100%', width: 'auto', height: 'auto',
        objectFit: 'contain', margin: '0', display: 'block'
      });
    });
    if (wrapper.children[0] !== img || wrapper.children[1] !== nextImg || wrapper.children.length !== 2) {
      wrapper.replaceChildren(img, nextImg);
    }
  } else {
    wrapper.style.flexDirection = 'row';
    Object.assign(img.style, {
      maxWidth: `${viewport.vw}px`, maxHeight: `${viewport.vh}px`, width: 'auto', height: 'auto',
      display: 'block', margin: '0 auto', flexShrink: '0', objectFit: 'contain'
    });
    if (wrapper.children.length !== 1 || wrapper.children[0] !== img) {
      wrapper.replaceChildren(img);
    }
  }
}

/**
 * Fit images to viewport using DOM reconciliation to minimize layout thrashing
 */
export function fitImagesToViewport(
  container: HTMLElement | null | undefined,
  spreadOffset = 0,
  isDualViewEnabled = false
): void {
  if (!container) return;

  const viewport = { vw: window.innerWidth, vh: window.innerHeight };

  Object.assign(container.style, {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0', margin: '0', width: '100%', maxWidth: 'none'
  });

  const allImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
  const existingWrappers = Array.from(container.querySelectorAll<HTMLElement>('.comic-row-wrapper'));
  let wrapperIndex = 0;

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];

    if (typeof (img as { naturalWidth?: unknown }).naturalWidth !== 'number') continue;

    const { pairWithNext, nextImg } = getPairingInfo(allImages, i, spreadOffset, isDualViewEnabled);

    const wrapper = existingWrappers.at(wrapperIndex);

    if (wrapper === undefined) {
      const newWrapper = document.createElement('div');
      newWrapper.className = 'comic-row-wrapper';
      container.appendChild(newWrapper);
      applyRowLayout(newWrapper, img, nextImg, viewport);
    } else {
      container.appendChild(wrapper);
      applyRowLayout(wrapper, img, nextImg, viewport);
    }

    if (pairWithNext) i++;
    wrapperIndex++;
  }

  while (wrapperIndex < existingWrappers.length) {
    existingWrappers[wrapperIndex].remove();
    wrapperIndex++;
  }
}

/**
 * Revert changes: clear styles and restore original DOM structure
 */
export function revertToOriginal(
  originalImages: HTMLImageElement[] | null | undefined,
  container: HTMLElement | null | undefined
): void {
  if (!container) return;

  container.style.cssText = '';

  if (!Array.isArray(originalImages)) return;

  originalImages.forEach(img => {
    if ((img as { style?: CSSStyleDeclaration }).style) {
      img.style.cssText = '';
    }

    if (img instanceof Node) {
      container.appendChild(img);
    }
  });

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
 * Wait for an image to load or timeout
 */
export async function waitForImageLoad(img: HTMLImageElement | null | undefined, timeout = 5000): Promise<void> {
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

      if (typeof (img as { removeEventListener?: unknown }).removeEventListener === 'function') {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      }
    };

    if (typeof (img as { addEventListener?: unknown }).addEventListener === 'function') {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    } else {
      clearTimeout(timer);
      resolve();
    }
  });
}

/**
 * Force image to start loading by setting loading='eager' and trying to decode
 */
export function forceImageLoad(img: HTMLImageElement | null | undefined): void {
  if (!img) return;

  if (typeof (img as { getAttribute?: unknown }).getAttribute === 'function' && img.getAttribute('loading') === 'lazy') {
    img.setAttribute('loading', 'eager');
  }

  if ('decode' in img && typeof img.decode === 'function') {
    img.decode().catch(() => { });
  }
}

/**
 * Helper to trigger background decoding of an image
 */
function triggerImageDecode(img: HTMLImageElement | null | undefined): void {
  if (img && !img.complete) {
    img.loading = 'eager';
    if ('decode' in img && typeof img.decode === 'function') {
      img.decode().catch(() => { });
    }
  }
}

/**
 * Preload images around current index
 */
export function preloadImages(
  images: (HTMLImageElement | null | undefined)[] | null | undefined,
  currentIndex: number,
  count = 3
): void {
  if (!Array.isArray(images) || images.length === 0) return;

  // Preload next images
  for (let i = 1; i <= count; i++) {
    const nextIndex = currentIndex + i;
    if (nextIndex < images.length) {
      triggerImageDecode(images[nextIndex]);
    }
  }

  // Preload previous images
  const prevCount = Math.min(count, 2);
  for (let i = 1; i <= prevCount; i++) {
    const prevIndex = currentIndex - i;
    if (prevIndex >= 0) {
      triggerImageDecode(images[prevIndex]);
    }
  }
}
