import { Metadata, SearchCache, RelatedWork, Tag } from './types';

const AES_GCM_PREFIX = 'AES-GCM:v1:';

/**
 * Derive a CryptoKey from a password and salt using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function toBase64(buf: Uint8Array<ArrayBuffer> | ArrayBuffer): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypt plaintext with AES-GCM using the given password.
 * Returns a string in the format: AES-GCM:v1:<salt_b64>:<iv_b64>:<ciphertext_b64>
 */
export async function encrypt(plaintext: string, password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const key = await deriveKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );
  return `${AES_GCM_PREFIX}${toBase64(salt)}:${toBase64(iv)}:${toBase64(ciphertext)}`;
}

/**
 * Decrypt a string previously encrypted by `encrypt`.
 * Throws if the data format is invalid or decryption fails (wrong password).
 */
export async function decrypt(encrypted: string, password: string): Promise<string> {
  if (!encrypted.startsWith(AES_GCM_PREFIX)) {
    throw new Error('Invalid encrypted data format');
  }
  const parts = encrypted.slice(AES_GCM_PREFIX.length).split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  const [saltB64, ivB64, ciphertextB64] = parts;
  const salt = fromBase64(saltB64);
  const iv = fromBase64(ivB64);
  const ciphertext = fromBase64(ciphertextB64);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plaintext);
}

/**
 * Check if a string is an AES-GCM encrypted blob produced by `encrypt`.
 */
export function isEncrypted(data: string): boolean {
  return data.startsWith(AES_GCM_PREFIX);
}

export interface ImageInfo {
  isLandscape: boolean;
}

export interface Rect {
  top: number;
  bottom: number;
}

const FAVORITE_PICK_CHANCE = 0.25;

/**
 * Calculate tag trends from favorites (sorted by occurrence count).
 * Selected tags are always sorted first, then pinned tags, then by count.
 * @param limit Max number of tags to return. 0 means no limit (return all).
 * @param pinnedTags List of tag texts that are pinned (shown first).
 * @param selectedTags List of tag texts that are currently selected (shown before pinned).
 */
export function calculateTrends(
  favorites: RelatedWork[],
  limit: number = 10,
  pinnedTags: string[] = [],
  selectedTags: string[] = []
): Array<{ tag: Tag; count: number; isPinned: boolean }> {
  const map = new Map<string, { tag: Tag; count: number }>();
  for (const fav of favorites) {
    for (const tag of (fav.tags ?? [])) {
      const entry = map.get(tag.text);
      if (entry) {
        entry.count++;
      } else {
        map.set(tag.text, { tag, count: 1 });
      }
    }
  }
  const pinnedSet = new Set(pinnedTags);
  const selectedSet = new Set(selectedTags);
  const withMeta = Array.from(map.values()).map(({ tag, count }) => ({
    tag,
    count,
    isPinned: pinnedSet.has(tag.text),
    isSelected: selectedSet.has(tag.text)
  }));
  const sorted = withMeta.sort((a, b) => {
    if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.count - a.count;
  });
  const results = limit > 0 ? sorted.slice(0, Math.max(limit, selectedSet.size)) : sorted;
  return results.map(({ tag, count, isPinned }) => ({ tag, count, isPinned }));
}

/**
 * Filter works by selected tag texts (AND logic: all selected tags must be present)
 */
export function filterWorksByTags(favorites: RelatedWork[], selectedTagTexts: Set<string>): RelatedWork[] {
  if (selectedTagTexts.size === 0) return favorites;
  return favorites.filter(work =>
    Array.from(selectedTagTexts).every(text =>
      (work.tags ?? []).some(tag => tag.text === text)
    )
  );
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
    // Safety check for runtime/tests
     
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
 * Check if current position is eligible for pairing (deterministic check)
 */
function isEligibleForPairing(i: number, total: number, spreadOffset: number): boolean {
  const effectiveIndex = i - spreadOffset;
  const isPairingPosition = effectiveIndex >= 0 && effectiveIndex % 2 === 0;
  const isFirstPage = i === 0;
  const isNextLastPage = i + 1 === total - 1;

  return isPairingPosition && i + 1 < total && !isFirstPage && !isNextLastPage;
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

   
  if (img && candidate && typeof img.naturalWidth === 'number' && typeof candidate.naturalWidth === 'number') {
    
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
export function fitImagesToViewport(container: HTMLElement, spreadOffset = 0, isDualViewEnabled = false): void {
   
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
     
    if (!img || typeof img.naturalWidth !== 'number') continue;

    const { pairWithNext, nextImg } = getPairingInfo(allImages, i, spreadOffset, isDualViewEnabled);

    const wrapper: HTMLElement | undefined = existingWrappers[wrapperIndex];
     
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
export function revertToOriginal(originalImages: HTMLImageElement[], container: HTMLElement): void {
   
  if (!container) return;

  container.style.cssText = '';

   
  if (!originalImages || !Array.isArray(originalImages)) return;

  originalImages.forEach(img => {
     
    if (img && img.style) {
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

   
  if (typeof img.getAttribute === 'function' && img.getAttribute('loading') === 'lazy') {
    img.setAttribute('loading', 'eager');
  }

  if ('decode' in img && typeof img.decode === 'function') {
    img.decode().catch(() => { });
  }
}

/**
 * Helper to trigger background decoding of an image
 */
function triggerImageDecode(img: HTMLImageElement): void {
   
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
export function preloadImages(images: HTMLImageElement[], currentIndex: number, count = 3): void {
   
  if (!images || !Array.isArray(images) || images.length === 0) return;

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

/**
 * Internal helper to map various work types to a common interface safely
 */
function toCandidates(works: unknown): { href: string }[] {
  if (!Array.isArray(works)) return [];
  const res: { href: string }[] = [];
  for (const w of works) {
    if (typeof w === 'object' && w !== null && 'href' in w && typeof (w as { href: unknown }).href === 'string') {
      res.push({ href: (w as { href: string }).href });
    }
  }
  return res;
}

/**
 * Normalize URL by removing search parameters and hashes.
 * Returns origin + pathname.
 */
export function normalizeUrl(url: string): string {
  try {
    // Try to use window.location.origin if available, otherwise default to a dummy base
    let base: string | undefined;
    if (typeof window !== 'undefined' && window.location) {
      base = window.location.origin;
    }
    if (!base || base === 'null' || base === 'undefined') {
      base = 'http://localhost';
    }

    const u = new URL(url, base);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

/**
 * Get the current number of unique candidates for random jump,
 * excluding history and current URL according to normal rules.
 */
export function getLuckyCandidatesCount(
  metadata: Metadata,
  luckyHistory: string[],
  currentUrl: string,
  searchCache?: SearchCache | null,
  favorites: RelatedWork[] = []
): number {
  const normalizedCurrent = normalizeUrl(currentUrl);
  const normalizedHistory = luckyHistory.map(h => normalizeUrl(h));

  const pool = getDiscoveryPool(metadata, searchCache, favorites);
  const excludeSet = new Set<string>();
  excludeSet.add(normalizedCurrent);
  normalizedHistory.forEach(h => excludeSet.add(h));

  return pool.filter(w => !excludeSet.has(normalizeUrl(w.href))).length;
}

/**
 * Check if the candidate pool is depleted (below threshold)
 */
export function isLuckyPoolDepleted(
  metadata: Metadata,
  luckyHistory: string[],
  currentUrl: string,
  searchCache?: SearchCache | null,
  favorites: RelatedWork[] = [],
  threshold = 5
): boolean {
  return getLuckyCandidatesCount(metadata, luckyHistory, currentUrl, searchCache, favorites) < threshold;
}

/**
 * Select a random work from candidates, excluding recently visited ones.
 * Uses a 2-step slot algorithm: 25% chance for a favorite, 75% for discovery.
 * Implements fallback logic to avoid empty candidates.
 */
export function pickRandomWork(
  metadata: Metadata,
  luckyHistory: string[],
  currentUrl: string,
  searchCache?: SearchCache | null,
  favorites: RelatedWork[] = []
): string | null {
  const normalizedCurrent = normalizeUrl(currentUrl);
  const normalizedHistory = luckyHistory.map(h => normalizeUrl(h));

  const getFilteredPool = (excludeHistoryCount: number | 'all'): { href: string }[] => {
    const pool = getDiscoveryPool(metadata, searchCache, favorites);
    const excludeSet = new Set<string>();
    excludeSet.add(normalizedCurrent);

    if (excludeHistoryCount === 'all') {
      normalizedHistory.forEach(h => excludeSet.add(h));
    } else if (typeof excludeHistoryCount === 'number' && excludeHistoryCount > 0) {
      normalizedHistory.slice(0, excludeHistoryCount).forEach(h => excludeSet.add(h));
    }

    return pool.filter(w => !excludeSet.has(normalizeUrl(w.href)));
  };

  // Try strict mode (all history + current)
  let candidates = getFilteredPool('all');

  // Fallback to relaxed mode (last 3 + current)
  if (candidates.length === 0) {
    candidates = getFilteredPool(3);
  }

  // Fallback to minimal mode (current only)
  if (candidates.length === 0) {
    candidates = getFilteredPool(0);
  }

  if (candidates.length === 0) return null;

  // 2-step slot selection within the final candidates
  const favoritePool = toCandidates(favorites).filter(f =>
    candidates.some(c => normalizeUrl(c.href) === normalizeUrl(f.href))
  );

  if (favoritePool.length > 0 && Math.random() < FAVORITE_PICK_CHANCE) {
    const target = favoritePool[Math.floor(Math.random() * favoritePool.length)];
    return target.href;
  } else {
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    return target.href;
  }
}

/**
 * Collect all available works for discovery, filtered and deduplicated
 */
function getDiscoveryPool(metadata: Metadata, searchCache?: SearchCache | null, favorites: RelatedWork[] = []): { href: string }[] {
  const sources: { href: string }[] = [];

  if (metadata.relatedWorks) {
    for (const w of metadata.relatedWorks) {
      if (!w.isPrivate && w.href) sources.push({ href: w.href });
    }
  }

  if (searchCache && searchCache.results) {
    sources.push(...toCandidates(searchCache.results.results));
  }

  sources.push(...toCandidates(favorites));

  const uniquePool: { href: string }[] = [];
  const seenHrefs = new Set<string>();
  for (const work of sources) {
    const href = work.href;
    if (!seenHrefs.has(href)) {
      seenHrefs.add(href);
      uniquePool.push({ href });
    }
  }
  return uniquePool;
}

