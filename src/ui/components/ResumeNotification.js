import { createElement } from '../utils.js';
import { t } from '../../i18n.js';

/**
 * @param {Object} props
 * @param {number} props.savedIndex
 * @param {number} props.totalPages
 * @param {Function} props.onResume
 * @param {Function} props.onSkip
 */
export function createResumeNotification({ savedIndex, totalPages, onResume, onSkip }) {
  console.log('[ResumeNotification] Creating notification...');
  console.log('[ResumeNotification] savedIndex:', savedIndex, 'totalPages:', totalPages);

  /** @type {any} */
  let timeoutId = null;
  /** @type {any} */
  let scrollHandler = null;

  const cleanup = () => {
    console.log('[ResumeNotification] Cleanup called');
    if (timeoutId) clearTimeout(timeoutId);
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    el.remove();
  };

  const message = t('ui.resumeNotification').replace('{page}', String(savedIndex + 1));
  console.log('[ResumeNotification] Message:', message);

  const continueBtn = createElement('button', {
    className: 'comic-helper-resume-btn comic-helper-resume-continue',
    textContent: t('ui.continueReading'),
    events: {
      click: () => {
        onResume();
        cleanup();
      }
    }
  });

  const skipBtn = createElement('button', {
    className: 'comic-helper-resume-btn comic-helper-resume-skip',
    textContent: t('ui.startFromBeginning'),
    events: {
      click: () => {
        onSkip();
        cleanup();
      }
    }
  });

  const closeBtn = createElement('button', {
    className: 'comic-helper-resume-btn comic-helper-resume-close',
    textContent: '×',
    events: {
      click: cleanup
    }
  });

  const el = createElement('div', {
    id: 'comic-helper-resume-notification',
    className: 'comic-helper-resume-notification'
  }, [
    createElement('span', { textContent: message }),
    continueBtn,
    skipBtn,
    closeBtn
  ]);

  // 15秒後に自動削除
  timeoutId = setTimeout(cleanup, 15000);
  console.log('[ResumeNotification] Timeout set');

  // スクロール開始で削除 (少し待ってから登録)
  setTimeout(() => {
    scrollHandler = () => cleanup();
    window.addEventListener('scroll', scrollHandler, { once: true });
    console.log('[ResumeNotification] Scroll handler set (delayed)');
  }, 1000); // 1秒待つ

  console.log('[ResumeNotification] Element created:', el);
  return { el };
}
