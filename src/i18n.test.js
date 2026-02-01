import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('i18n', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return english by default (mocking navigator.language as en)', async () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    const { t } = await import('./i18n.js');
    expect(t('ui.spread')).toBe('Spread');
  });

  it('should return japanese when language is ja', async () => {
    vi.stubGlobal('navigator', { language: 'ja-JP' });
    const { t } = await import('./i18n.js');
    expect(t('ui.spread')).toBe('見開き');
  });

  it('should fallback to english for unsupported languages', async () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' });
    const { t } = await import('./i18n.js');
    expect(t('ui.spread')).toBe('Spread');
  });

  it('should return key name if key not found', async () => {
    vi.stubGlobal('navigator', { language: 'en-US' });
    const { t } = await import('./i18n.js');
    expect(t('non.existent.key')).toBe('non.existent.key');
  });

  it('should have consistent keys between en and ja dictionaries', async () => {
    const { MESSAGES } = await import('./i18n.js');
    const enKeys = Object.keys(MESSAGES.en);
    const jaKeys = Object.keys(MESSAGES.ja);
    expect(jaKeys).toEqual(expect.arrayContaining(enKeys));
    expect(enKeys).toEqual(expect.arrayContaining(jaKeys));

    // Check nested keys
    for (const topKey of enKeys) {
      const enSubKeys = Object.keys(MESSAGES.en[topKey]);
      const jaSubKeys = Object.keys(MESSAGES.ja[topKey]);
      expect(jaSubKeys).toEqual(expect.arrayContaining(enSubKeys));
      expect(enSubKeys).toEqual(expect.arrayContaining(jaSubKeys));
    }
  });
});
