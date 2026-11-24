import { Store } from '../store';
import { SiteAdapter } from '../types';
import { resolveRedirectTarget } from '../logic';

/**
 * 作品ページ以外を開いたとき、最後に閲覧した作品へリダイレクトする。
 * 判定ロジックは logic.ts の resolveRedirectTarget に委譲し、
 * ここでは DOM / ブラウザ API の値を集めて実行するだけを担当する。
 */
export class RedirectManager {
  private store: Store;
  private adapter: SiteAdapter;

  constructor(store: Store, adapter: SiteAdapter) {
    this.store = store;
    this.adapter = adapter;
  }

  /**
   * @returns リダイレクトを実行した場合 true
   */
  run = (): boolean => {
    const state = this.store.getState();
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;

    const target = resolveRedirectTarget({
      enabled: state.isRedirectEnabled,
      currentUrl: window.location.href,
      referrer: document.referrer,
      navigationType: navigation?.type ?? '',
      history: state.luckyHistory,
      isWorkUrl: (url) => this.adapter.isWorkPage(url)
    });

    if (target === null) return false;
    // replace: リダイレクト元を履歴に残さない（戻るボタンでの再リダイレクトを防ぐ）
    window.location.replace(target);
    return true;
  };
}
