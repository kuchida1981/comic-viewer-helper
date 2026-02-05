import { t } from './i18n';

export interface Shortcut {
  id: string;
  label: string;
  keys: string[];
  description: string;
  condition?: string;
  shift?: boolean;
}

/**
 * ナビゲーション方向の割り当て。
 * 右開き書籍: ArrowLeft = next, ArrowRight = prev
 * 将来の左開き対応で反転可能にする（#73）
 */
export const NAV_ARROW_KEYS = {
  next: 'ArrowLeft',
  prev: 'ArrowRight'
} as const;

export const SHORTCUTS: Shortcut[] = [
  {
    id: 'nextPage',
    label: t('shortcuts.nextPage.label'),
    keys: ['j', 'ArrowDown', 'PageDown', NAV_ARROW_KEYS.next, 'Space'],
    description: t('shortcuts.nextPage.desc')
  },
  {
    id: 'prevPage',
    label: t('shortcuts.prevPage.label'),
    keys: ['k', 'ArrowUp', 'PageUp', NAV_ARROW_KEYS.prev, 'Shift+Space'],
    description: t('shortcuts.prevPage.desc')
  },
  {
    id: 'dualView',
    label: t('shortcuts.dualView.label'),
    keys: ['d'],
    description: t('shortcuts.dualView.desc')
  },
  {
    id: 'spreadOffset',
    label: t('shortcuts.spreadOffset.label'),
    keys: ['o'],
    description: t('shortcuts.spreadOffset.desc'),
    condition: t('shortcuts.spreadOffset.cond')
  },
  {
    id: 'metadata',
    label: t('shortcuts.metadata.label'),
    keys: ['i'],
    description: t('shortcuts.metadata.desc')
  },
  {
    id: 'fullscreen',
    label: t('shortcuts.fullscreen.label'),
    keys: ['f'],
    description: t('shortcuts.fullscreen.desc')
  },
  {
    id: 'help',
    label: t('shortcuts.help.label'),
    keys: ['?'],
    description: t('shortcuts.help.desc')
  },
  {
    id: 'search',
    label: t('shortcuts.search.label'),
    keys: ['/'],
    description: t('shortcuts.search.desc')
  },
  {
    id: 'randomJump',
    label: t('shortcuts.randomJump.label'),
    keys: ['p'],
    description: t('shortcuts.randomJump.desc')
  },
  {
    id: 'closeModal',
    label: t('shortcuts.closeModal.label'),
    keys: ['Escape'],
    description: t('shortcuts.closeModal.desc')
  }
];
