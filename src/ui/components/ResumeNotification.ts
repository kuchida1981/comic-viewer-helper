import { createElement } from '../utils';
import { t } from '../../i18n';

export interface ResumeNotificationProps {
  savedIndex: number;
  onResume: () => void;
  onSkip: () => void;
}

export interface ResumeNotificationComponent {
  el: HTMLElement;
}

export function createResumeNotification({ savedIndex, onResume, onSkip }: ResumeNotificationProps): ResumeNotificationComponent {
  let timeoutId: number | null = null;
  let scrollHandler: (() => void) | null = null;

  const message = t('ui.resumeNotification').replace('{page}', String(savedIndex + 1));

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
      click: () => cleanup()
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

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    el.remove();
  };

  // 15秒後に自動削除
  timeoutId = window.setTimeout(cleanup, 15000);

  // スクロール開始で削除 (少し待ってから登録)
  window.setTimeout(() => {
    scrollHandler = () => cleanup();
    window.addEventListener('scroll', scrollHandler, { once: true });
  }, 1000); // 1秒待つ

  return { el };
}