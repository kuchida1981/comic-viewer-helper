import { t } from './i18n.js';

/**
 * @typedef {Object} Shortcut
 * @property {string} id - 一意識別子
 * @property {string} label - 表示用のラベル
 * @property {string[]} keys - キーのリスト
 * @property {string} description - 機能の説明
 * @property {string} [condition] - ショートカットが有効になる条件の説明
 * @property {boolean} [shift] - Shiftキーが必要か
 */

/** @type {Shortcut[]} */
export const SHORTCUTS = [
  {
    id: 'nextPage',
    label: t('shortcuts.nextPage.label'),
    keys: ['j', 'ArrowDown', 'PageDown', 'ArrowRight', 'Space'],
    description: t('shortcuts.nextPage.desc')
  },
  {
    id: 'prevPage',
    label: t('shortcuts.prevPage.label'),
    keys: ['k', 'ArrowUp', 'PageUp', 'ArrowLeft', 'Shift+Space'],
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
    id: 'help',
    label: t('shortcuts.help.label'),
    keys: ['?'],
    description: t('shortcuts.help.desc')
  },
  {
    id: 'closeModal',
    label: t('shortcuts.closeModal.label'),
    keys: ['Escape'],
    description: t('shortcuts.closeModal.desc')
  }
];