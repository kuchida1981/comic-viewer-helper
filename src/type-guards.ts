import { GuiPos } from './store';
import { ResumeData } from './managers/ResumeManager';
import { SearchCache, SearchContext, RelatedWork, HistoryEntry } from './types';

/**
 * Checks if the value is a non-null object (and not an array)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if the value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Type guard for RelatedWork
 */
export function isRelatedWork(value: unknown): value is RelatedWork {
  if (!isObject(value)) return false;
  return typeof value.title === 'string' && typeof value.href === 'string' && typeof value.thumb === 'string';
}

/**
 * Type guard for RelatedWork[]
 */
export function isRelatedWorkArray(value: unknown): value is RelatedWork[] {
  return Array.isArray(value) && value.every(isRelatedWork);
}

/**
 * Type guard for HistoryEntry
 */
export function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!isRelatedWork(value)) return false;
  const v = value as unknown as Record<string, unknown>;
  return typeof v.viewCount === 'number' &&
    typeof v.lastViewedAt === 'number' &&
    typeof v.firstViewedAt === 'number';
}

/**
 * Type guard for HistoryEntry[]
 */
export function isHistoryEntryArray(value: unknown): value is HistoryEntry[] {
  return Array.isArray(value) && value.every(isHistoryEntry);
}

/**
 * Type guard for GuiPos
 */
export function isGuiPos(value: unknown): value is GuiPos {
  if (!isObject(value)) return false;
  return typeof value.top === 'number' && typeof value.left === 'number';
}

/**
 * Type guard for ResumeData
 */
export function isResumeData(value: unknown): value is ResumeData {
  if (!isObject(value)) return false;
  return typeof value.pageIndex === 'number';
}

/**
 * Type guard for Record<string, ResumeData>
 */
export function isResumeDataMap(value: unknown): value is Record<string, ResumeData> {
  if (!isObject(value)) return false;
  return Object.values(value).every(isResumeData);
}

/**
 * Type guard for SearchContext
 */
export function isSearchContext(value: unknown): value is SearchContext {
  if (!isObject(value)) return false;
  if (typeof value.type !== 'string') return false;
  return ['keyword', 'tag', 'genre', 'artist'].includes(value.type);
}

/**
 * Type guard for SearchCache
 */
export function isSearchCache(value: unknown): value is SearchCache {
  if (!isObject(value)) return false;
  if (typeof value.query !== 'string') return false;
  if (typeof value.fetchedAt !== 'number') return false;
  if (!isObject(value.results)) return false;
  return Array.isArray(value.results['results']);
}
