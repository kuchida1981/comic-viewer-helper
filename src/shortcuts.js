/**
 * @typedef {Object} Shortcut
 * @property {string} label - 表示用のラベル
 * @property {string[]} keys - キーのリスト
 * @property {string} description - 機能の説明
 * @property {string} [condition] - ショートカットが有効になる条件の説明
 * @property {boolean} [shift] - Shiftキーが必要か
 */

/** @type {Shortcut[]} */
export const SHORTCUTS = [
  {
    label: 'Next Page',
    keys: ['j', 'ArrowDown', 'PageDown', 'ArrowRight', 'Space'],
    description: '次のページへ移動'
  },
  {
    label: 'Prev Page',
    keys: ['k', 'ArrowUp', 'PageUp', 'ArrowLeft', 'Shift+Space'],
    description: '前のページへ移動'
  },
  {
    label: 'Dual View',
    keys: ['d'],
    description: '見開きモードのON/OFF'
  },
  {
    label: 'Spread Offset',
    keys: ['o'],
    description: '見開きオフセットの切替 (0 ↔ 1)',
    condition: '見開きモード中のみ'
  },
  {
    label: 'Metadata',
    keys: ['i'],
    description: '作品情報（メタデータ）の表示'
  },
  {
    label: 'Help',
    keys: ['?'],
    description: 'このヘルプの表示'
  },
  {
    label: 'Close Modal',
    keys: ['Escape'],
    description: 'モーダルを閉じる'
  }
];
