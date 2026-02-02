/**
 * @typedef {Object} Dictionary
 * @property {Record<string, string>} ui
 * @property {Record<string, { label: string, desc: string, cond?: string }>} shortcuts
 */

/** @type {Record<string, Dictionary>} */
export const MESSAGES = {
  en: {
    ui: {
      spread: 'Spread',
      offset: 'Offset',
      info: 'Info',
      help: 'Help',
      close: 'Close',
      tags: 'Tags',
      related: 'Related Works',
      version: 'Version',
      stable: 'stable',
      unstable: 'unstable',
      keyboardShortcuts: 'Keyboard Shortcuts',
      goFirst: 'Go to First',
      goPrev: 'Go to Previous',
      goNext: 'Go to Next',
      goLast: 'Go to Last',
      showMetadata: 'Show Metadata',
      showHelp: 'Show Help',
      shiftOffset: 'Shift spread pairing by 1 page (Offset)',
      space: 'Space',
      enable: 'Enable Comic Viewer Helper',
      disable: 'Disable Comic Viewer Helper',
      resume: 'Resume',
      resumeNotification: 'Resume from page {page}?',
      continueReading: 'Continue',
      startFromBeginning: 'Start Over'
    },
    shortcuts: {
      nextPage: { label: 'Next Page', desc: 'Move to next page' },
      prevPage: { label: 'Prev Page', desc: 'Move to previous page' },
      dualView: { label: 'Dual View', desc: 'Toggle Dual View' },
      spreadOffset: { label: 'Spread Offset', desc: 'Toggle Offset (0 ↔ 1)', cond: 'Dual View only' },
      metadata: { label: 'Metadata', desc: 'Show metadata' },
      help: { label: 'Help', desc: 'Show this help' },
      closeModal: { label: 'Close Modal', desc: 'Close modal' }
    }
  },
  ja: {
    ui: {
      spread: '見開き',
      offset: 'オフセット',
      info: '作品情報',
      help: 'ヘルプ',
      close: '閉じる',
      tags: 'タグ',
      related: '関連作品',
      version: 'バージョン',
      stable: '安定版',
      unstable: '開発版',
      keyboardShortcuts: 'キーボードショートカット',
      goFirst: '最初へ',
      goPrev: '前へ',
      goNext: '次へ',
      goLast: '最後へ',
      showMetadata: '作品情報を表示',
      showHelp: 'ヘルプを表示',
      shiftOffset: '見開きペアを1ページ分ずらす（オフセット）',
      space: 'スペース',
      enable: 'スクリプトを有効にする',
      disable: 'スクリプトを無効にする',
      resume: 'レジューム',
      resumeNotification: '{page}ページから再開しますか？',
      continueReading: '続きから',
      startFromBeginning: '最初から'
    },
    shortcuts: {
      nextPage: { label: '次ページ', desc: '次のページへ移動' },
      prevPage: { label: '前ページ', desc: '前のページへ移動' },
      dualView: { label: '見開き', desc: '見開きモードのON/OFF' },
      spreadOffset: { label: '見開きオフセット', desc: '見開きオフセットの切替 (0 ↔ 1)', cond: '見開きモード中のみ' },
      metadata: { label: '作品情報', desc: '作品情報（メタデータ）の表示' },
      help: { label: 'ヘルプ', desc: 'このヘルプの表示' },
      closeModal: { label: '閉じる', desc: 'モーダルを閉じる' }
    }
  }
};

/**
 * Detect language from browser settings
 * @returns {string}
 */
const getLanguage = () => {
  const lang = (navigator.language || 'en').split('-')[0];
  return MESSAGES[lang] ? lang : 'en';
};

const currentLang = getLanguage();

/**
 * Get translation for a given key
 * @param {string} path Dot notation path (e.g. 'ui.spread')
 * @returns {string}
 */
export function t(path) {
  const keys = path.split('.');
  /** @type {any} */
  let result = MESSAGES[currentLang];
  /** @type {any} */
  let fallback = MESSAGES['en'];

  for (const key of keys) {
    result = result ? result[key] : undefined;
    fallback = fallback ? fallback[key] : undefined;
  }

  return result ?? fallback ?? path;
}


  