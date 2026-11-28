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
 * @param excludedTypes Tag types to exclude (`null` means tags without a type). Applied before sorting and limiting.
 */
export function calculateTrends(
  favorites: RelatedWork[],
  limit: number = 10,
  pinnedTags: string[] = [],
  selectedTags: string[] = [],
  excludedTypes: ReadonlySet<string | null> = new Set()
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
  const withMeta = Array.from(map.values()).filter(({ tag }) => !excludedTypes.has(tag.type)).map(({ tag, count }) => ({
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
 * Calculate the tag cloud size level (1..levels) for a tag count.
 * Linear scale between min and max. When min === max, the middle level is returned.
 */
export function calculateTagCloudLevel(count: number, min: number, max: number, levels: number = 5): number {
  if (max <= min) return Math.ceil(levels / 2);
  const ratio = (count - min) / (max - min);
  const level = 1 + Math.round(ratio * (levels - 1));
  return Math.min(levels, Math.max(1, level));
}

/**
 * Arrange tag cloud items so that the most frequent ones sit in the center.
 * Items are ranked by count (descending, ties by text ascending); rank 1 goes to the
 * center, rank 2 to its right, rank 3 to its left, and so on alternating outward.
 * The input array is not modified.
 */
export function arrangeTagCloud<T extends { tag: { text: string }; count: number }>(items: T[]): T[] {
  const ranked = [...items].sort((a, b) => b.count - a.count || a.tag.text.localeCompare(b.tag.text));
  if (ranked.length === 0) return [];
  const left: T[] = [];
  const right: T[] = [];
  ranked.slice(1).forEach((item, i) => {
    (i % 2 === 0 ? right : left).push(item);
  });
  return [...left.reverse(), ranked[0], ...right];
}

/**
 * Collect the distinct tag types present in favorites (`null` for untyped tags, always last).
 */
export function getTagTypes(favorites: RelatedWork[]): Array<string | null> {
  const types = new Set<string | null>();
  for (const fav of favorites) {
    for (const tag of (fav.tags ?? [])) {
      types.add(tag.type);
    }
  }
  const typed = Array.from(types).filter((type): type is string => type !== null).sort();
  return types.has(null) ? [...typed, null] : typed;
}

/**
 * Toggle tag type filter state for the tag cloud view.
 * - When all types are selected (`excludedTypes.size === 0`), clicking a type selects only that type (excludes all others).
 * - When an excluded type is clicked, it becomes selected (removed from `excludedTypes`).
 * - When a selected type is clicked while others are excluded, it becomes excluded, except the last remaining selected type cannot be excluded.
 */
export function toggleTagTypeFilter(
  excludedTypes: ReadonlySet<string | null>,
  allTypes: ReadonlyArray<string | null>,
  clickedType: string | null
): Set<string | null> {
  if (excludedTypes.size === 0) {
    return new Set(allTypes.filter(type => type !== clickedType));
  }
  const next = new Set(excludedTypes);
  if (next.has(clickedType)) {
    next.delete(clickedType);
    return next;
  }
  const activeCount = allTypes.filter(type => !excludedTypes.has(type)).length;
  if (activeCount <= 1) {
    return next;
  }
  next.add(clickedType);
  return next;
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

export interface VisibleElementLike {
  getBoundingClientRect?: () => Rect;
}

/**
 * Get primary visible image index based on visible height and proximity to center
 */
export function getPrimaryVisibleImageIndex(
  imgs: ReadonlyArray<VisibleElementLike | null | undefined> | null | undefined,
  windowHeight: number
): number {
  const list: ReadonlyArray<VisibleElementLike | null | undefined> = Array.isArray(imgs) ? imgs : [];
  if (list.length === 0) return -1;

  let maxVisibleHeight = 0;
  let minDistanceToCenter = Infinity;
  let primaryIndex = -1;
  const viewportCenter = windowHeight / 2;

  list.forEach((img, index) => {
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
 * Check if current position is eligible for pairing (deterministic check)
 */
export function isEligibleForPairing(i: number, total: number, spreadOffset: number): boolean {
  const effectiveIndex = i - spreadOffset;
  const isPairingPosition = effectiveIndex >= 0 && effectiveIndex % 2 === 0;
  const isFirstPage = i === 0;
  const isNextLastPage = i + 1 === total - 1;

  return isPairingPosition && i + 1 < total && !isFirstPage && !isNextLastPage;
}

/**
 * Determine navigation direction from wheel event
 */
export function getNavigationDirection(event: { deltaY: number }, threshold = 50): 'next' | 'prev' | 'none' {
  if (Math.abs(event.deltaY) < threshold) {
    return 'none';
  }
  return event.deltaY > 0 ? 'next' : 'prev';
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
export function normalizeUrl(url: string, baseOrigin?: string): string {
  try {
    const base = baseOrigin && baseOrigin !== 'null' && baseOrigin !== 'undefined' ? baseOrigin : 'http://localhost';
    const u = new URL(url, base);
    return u.origin + u.pathname;
  } catch {
    return url;
  }
}

/**
 * Extract origin from an absolute URL safely.
 */
function extractOrigin(url: string): string | undefined {
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
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
  const origin = extractOrigin(currentUrl);
  const normalizedCurrent = normalizeUrl(currentUrl, origin);
  const normalizedHistory = luckyHistory.map(h => normalizeUrl(h, origin));

  const pool = getDiscoveryPool(metadata, searchCache, favorites);
  const excludeSet = new Set<string>();
  excludeSet.add(normalizedCurrent);
  normalizedHistory.forEach(h => excludeSet.add(h));

  return pool.filter(w => !excludeSet.has(normalizeUrl(w.href, origin))).length;
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
  const origin = extractOrigin(currentUrl);
  const normalizedCurrent = normalizeUrl(currentUrl, origin);
  const normalizedHistory = luckyHistory.map(h => normalizeUrl(h, origin));

  const getFilteredPool = (excludeHistoryCount: number | 'all'): { href: string }[] => {
    const pool = getDiscoveryPool(metadata, searchCache, favorites);
    const excludeSet = new Set<string>();
    excludeSet.add(normalizedCurrent);

    if (excludeHistoryCount === 'all') {
      normalizedHistory.forEach(h => excludeSet.add(h));
    } else if (typeof excludeHistoryCount === 'number' && excludeHistoryCount > 0) {
      normalizedHistory.slice(0, excludeHistoryCount).forEach(h => excludeSet.add(h));
    }

    return pool.filter(w => !excludeSet.has(normalizeUrl(w.href, origin)));
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
    candidates.some(c => normalizeUrl(c.href, origin) === normalizeUrl(f.href, origin))
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
function getDiscoveryPool(
  metadata: { relatedWorks?: RelatedWork[] | null },
  searchCache?: SearchCache | null,
  favorites: RelatedWork[] = []
): { href: string }[] {
  const sources: { href: string }[] = [];

  if (Array.isArray(metadata.relatedWorks)) {
    for (const w of metadata.relatedWorks) {
      if (!w.isPrivate && w.href) sources.push({ href: w.href });
    }
  }

  if (searchCache?.results) {
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


export interface RedirectContext {
  enabled: boolean;
  currentUrl: string;
  /** document.referrer (empty string when none) */
  referrer: string;
  /** Navigation Timing の type ('navigate' | 'reload' | 'back_forward' | 'prerender' | '') */
  navigationType: string;
  history: { href: string; lastViewedAt: number }[];
  /** URLが作品ページかどうかの判定 (SiteAdapter.isWorkPage) */
  isWorkUrl: (url: string) => boolean;
}

/**
 * Whether the referrer is a page on the same origin as the current URL.
 * An empty or unparsable referrer is treated as external.
 */
function isSameOriginReferrer(referrer: string, currentUrl: string): boolean {
  if (!referrer) return false;
  try {
    return new URL(referrer).origin === new URL(currentUrl).origin;
  } catch {
    return false;
  }
}

/**
 * Pick the entry with the greatest lastViewedAt (not relying on array order).
 */
function pickLastViewed<T extends { lastViewedAt: number }>(history: T[]): T | null {
  let latest: T | null = null;
  for (const entry of history) {
    if (!latest || entry.lastViewedAt > latest.lastViewedAt) latest = entry;
  }
  return latest;
}

/**
 * Decide where to redirect when a non-work page is opened.
 * Returns the URL of the last viewed work, or null if no redirect should happen.
 */
export function resolveRedirectTarget(ctx: RedirectContext): string | null {
  if (!ctx.enabled) return null;
  if (ctx.isWorkUrl(ctx.currentUrl)) return null;
  if (ctx.navigationType === 'reload' || ctx.navigationType === 'back_forward') return null;
  if (isSameOriginReferrer(ctx.referrer, ctx.currentUrl)) return null;

  const latest = pickLastViewed(ctx.history);
  if (!latest) return null;

  const origin = extractOrigin(ctx.currentUrl);
  if (normalizeUrl(latest.href, origin) === normalizeUrl(ctx.currentUrl, origin)) return null;
  if (!ctx.isWorkUrl(latest.href)) return null;
  return latest.href;
}

export interface TagGraphNode {
  tag: Tag;
  count: number;
}

export interface TagGraphLink {
  source: string;
  target: string;
  /** Jaccard coefficient of the two tags (0..1] */
  strength: number;
}

export interface TagGraph {
  nodes: TagGraphNode[];
  links: TagGraphLink[];
}

export const TAG_GRAPH_NODE_LIMIT = 50;
const TAG_GRAPH_MIN_CO_OCCURRENCE = 2;
const TAG_GRAPH_LINKS_PER_NODE = 3;

function uniqueTags(tags: Tag[]): Tag[] {
  return Array.from(new Map(tags.map(tag => [tag.text, tag])).values());
}

function countTagPairs(works: Array<{ tags: Tag[] }>, ids: ReadonlySet<string>): Array<{ source: string; target: string; together: number }> {
  const pairs = new Map<string, { source: string; target: string; together: number }>();
  for (const work of works) {
    const texts = work.tags.map(tag => tag.text).filter(text => ids.has(text)).sort();
    texts.forEach((source, i) => {
      for (const target of texts.slice(i + 1)) {
        const key = JSON.stringify([source, target]);
        const together = (pairs.get(key)?.together ?? 0) + 1;
        pairs.set(key, { source, target, together });
      }
    });
  }
  return Array.from(pairs.values());
}

/** Keep only the links that are among the strongest ones of at least one of their ends. */
function pruneTagLinks(links: TagGraphLink[]): TagGraphLink[] {
  const ranked = [...links].sort((a, b) =>
    b.strength - a.strength || a.source.localeCompare(b.source) || a.target.localeCompare(b.target));
  const used = new Map<string, number>();
  return ranked.filter(({ source, target }) => {
    const sourceUsed = used.get(source) ?? 0;
    const targetUsed = used.get(target) ?? 0;
    used.set(source, sourceUsed + 1);
    used.set(target, targetUsed + 1);
    return sourceUsed < TAG_GRAPH_LINKS_PER_NODE || targetUsed < TAG_GRAPH_LINKS_PER_NODE;
  });
}

/**
 * Build the tag co-occurrence graph of favorites.
 * Nodes are the most frequent tags (ties by text); a tag is counted once per work.
 * @param excludedTypes Tag types to exclude, applied before the node limit.
 */
export function buildTagGraph(
  favorites: RelatedWork[],
  excludedTypes: ReadonlySet<string | null> = new Set(),
  limit: number = TAG_GRAPH_NODE_LIMIT
): TagGraph {
  const works = favorites.map(work => ({ ...work, tags: uniqueTags(work.tags ?? []) }));
  const nodes = calculateTrends(works, 0, [], [], excludedTypes)
    .sort((a, b) => b.count - a.count || a.tag.text.localeCompare(b.tag.text))
    .slice(0, limit)
    .map(({ tag, count }) => ({ tag, count }));
  const counts = new Map(nodes.map(({ tag, count }) => [tag.text, count]));

  const candidates = countTagPairs(works, new Set(counts.keys()))
    .filter(({ together }) => together >= TAG_GRAPH_MIN_CO_OCCURRENCE)
    .map(({ source, target, together }) => ({
      source,
      target,
      strength: together / (counts.get(source)! + counts.get(target)! - together)
    }));
  return { nodes, links: pruneTagLinks(candidates) };
}

export interface GraphBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** A fixed body (being dragged) does not move by itself */
  fixed: boolean;
}

export const GRAPH_ALPHA_MIN = 0.02;
const GRAPH_ALPHA_DECAY = 0.985;
const GRAPH_REPULSION = 120;
const GRAPH_COLLISION_PADDING = 28;
const GRAPH_COLLISION_STRENGTH = 0.25;
const GRAPH_LINK_LENGTH = 80;
const GRAPH_LINK_STRENGTH = 0.12;
const GRAPH_GRAVITY_X = 0.025;
const GRAPH_GRAVITY_Y = 0.07;
/** Nothing holds an unlinked node back, so it needs a stronger pull to stay in view */
const GRAPH_ISOLATED_GRAVITY_FACTOR = 3;
const GRAPH_DAMPING = 0.8;
const GRAPH_MAX_SPEED = 20;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Deterministic initial placement on a spiral around the origin. */
export function createGraphBody(id: string, index: number, radius: number): GraphBody {
  const distance = 30 * Math.sqrt(index + 0.5);
  const angle = index * GOLDEN_ANGLE;
  return {
    id,
    x: distance * Math.cos(angle),
    y: distance * Math.sin(angle),
    vx: 0,
    vy: 0,
    radius,
    fixed: false
  };
}

function applyForce(a: GraphBody, b: GraphBody, fx: number, fy: number): void {
  a.vx += fx;
  a.vy += fy;
  b.vx -= fx;
  b.vy -= fy;
}

function applyRepulsion(a: GraphBody, b: GraphBody, alpha: number): void {
  // Separate exactly overlapping bodies along the x axis
  const dx = b.x - a.x || (a.y === b.y ? 1 : 0);
  const dy = b.y - a.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const overlap = Math.max(0, a.radius + b.radius + GRAPH_COLLISION_PADDING - distance);
  const force = (GRAPH_REPULSION / distance + overlap * GRAPH_COLLISION_STRENGTH) * alpha;
  applyForce(a, b, -(dx / distance) * force, -(dy / distance) * force);
}

function applySpring(a: GraphBody, b: GraphBody, stiffness: number, alpha: number): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const force = (distance - GRAPH_LINK_LENGTH) * GRAPH_LINK_STRENGTH * stiffness * alpha;
  applyForce(a, b, (dx / distance) * force, (dy / distance) * force);
}

function moveBody(body: GraphBody, gravity: number): void {
  if (body.fixed) {
    body.vx = 0;
    body.vy = 0;
    return;
  }
  const clamp = (v: number): number => Math.max(-GRAPH_MAX_SPEED, Math.min(GRAPH_MAX_SPEED, v));
  body.vx = clamp((body.vx - body.x * GRAPH_GRAVITY_X * gravity) * GRAPH_DAMPING);
  body.vy = clamp((body.vy - body.y * GRAPH_GRAVITY_Y * gravity) * GRAPH_DAMPING);
  body.x += body.vx;
  body.y += body.vy;
}

/**
 * Advance the force simulation by one step. The input is not modified.
 * @param alpha Current "temperature" (1 = hot); it decays on every step.
 */
export function stepTagGraph(
  bodies: GraphBody[],
  links: TagGraphLink[],
  alpha: number
): { bodies: GraphBody[]; alpha: number } {
  const next = bodies.map(body => ({ ...body }));
  next.forEach((a, i) => {
    for (const b of next.slice(i + 1)) applyRepulsion(a, b, alpha);
  });
  const byId = new Map(next.map(body => [body.id, body]));
  const degrees = new Map<string, number>();
  for (const { source, target } of links) {
    degrees.set(source, (degrees.get(source) ?? 0) + 1);
    degrees.set(target, (degrees.get(target) ?? 0) + 1);
  }
  for (const { source, target, strength } of links) {
    const a = byId.get(source);
    const b = byId.get(target);
    // Weaken the springs of hubs so that they do not collapse into a hairball
    if (a && b) applySpring(a, b, (0.5 + strength) / Math.min(degrees.get(source)!, degrees.get(target)!), alpha);
  }
  for (const body of next) moveBody(body, degrees.has(body.id) ? alpha : alpha * GRAPH_ISOLATED_GRAVITY_FACTOR);
  return { bodies: next, alpha: alpha * GRAPH_ALPHA_DECAY };
}

/** Pan offset and zoom scale of the graph, in viewBox units */
export interface GraphView {
  x: number;
  y: number;
  scale: number;
}

export const GRAPH_MIN_SCALE = 0.3;
export const GRAPH_MAX_SCALE = 4;

/** Zoom by `factor` keeping the viewBox point under the pointer in place. */
export function zoomGraphView(view: GraphView, point: { x: number; y: number }, factor: number): GraphView {
  const scale = Math.max(GRAPH_MIN_SCALE, Math.min(GRAPH_MAX_SCALE, view.scale * factor));
  const ratio = scale / view.scale;
  return {
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
    scale
  };
}

/**
 * Convert client coordinates to viewBox coordinates for a viewBox centered on the
 * origin with preserveAspectRatio "xMidYMid meet".
 */
export function toViewBoxPoint(
  client: { x: number; y: number },
  rect: { left: number; top: number; width: number; height: number },
  viewBox: { width: number; height: number }
): { x: number; y: number } {
  // An element that is not laid out has no size; fall back to 1:1
  const scale = Math.min(rect.width / viewBox.width, rect.height / viewBox.height) || 1;
  return {
    x: (client.x - rect.left - rect.width / 2) / scale,
    y: (client.y - rect.top - rect.height / 2) / scale
  };
}
