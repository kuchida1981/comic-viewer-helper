import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('i18n', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('should return english by default (mocking navigator.language as en)', async () => {
    vi.stubGlobal('navigator', { language: 'en-US' } as unknown as Navigator);
    const { t } = await import('./i18n.js');
    expect(t('ui.spread')).toBe('Spread');
  });

  it('should return japanese when language is ja', async () => {
    vi.stubGlobal('navigator', { language: 'ja-JP' } as unknown as Navigator);
    const { t } = await import('./i18n.js');
    expect(t('ui.spread')).toBe('見開き');
  });

  it('should fallback to english for unsupported languages', async () => {
    vi.stubGlobal('navigator', { language: 'fr-FR' } as unknown as Navigator);
    const { t } = await import('./i18n.js');
    expect(t('ui.spread')).toBe('Spread');
  });

  it('should return key name if key not found', async () => {
    vi.stubGlobal('navigator', { language: 'en-US' } as unknown as Navigator);
    const { t } = await import('./i18n.js');
    // @ts-expect-error - Testing non-existent key
    expect(t('non.existent.key')).toBe('non.existent.key');
  });

  it('should have consistent keys between en and ja dictionaries', async () => {
    const { MESSAGES } = await import('./i18n.js');
    const enKeys = Object.keys(MESSAGES.en) as Array<keyof typeof MESSAGES.en>;
    const jaKeys = Object.keys(MESSAGES.ja) as Array<keyof typeof MESSAGES.ja>;
    
    // Check top-level keys
    expect(jaKeys).toEqual(expect.arrayContaining(enKeys));
    expect(enKeys).toEqual(expect.arrayContaining(jaKeys));

    // Check nested keys
    for (const topKey of enKeys) {
      
      const enSubKeys = Object.keys((MESSAGES.en as any)[topKey]);
      
      const jaSubKeys = Object.keys((MESSAGES.ja as any)[topKey]);
      expect(jaSubKeys).toEqual(expect.arrayContaining(enSubKeys));
      expect(enSubKeys).toEqual(expect.arrayContaining(jaSubKeys));
    }
  });

  describe('resume messages', () => {
    it('should have resume message in english', async () => {
      vi.stubGlobal('navigator', { language: 'en-US' } as unknown as Navigator);
      const { t } = await import('./i18n.js');
      expect(t('ui.resume')).toBe('Resume');
      expect(t('ui.resumeNotification')).toBe('Resume from page {page}?');
      expect(t('ui.continueReading')).toBe('Continue');
      expect(t('ui.startFromBeginning')).toBe('Start Over');
    });

    it('should have resume message in japanese', async () => {
      vi.stubGlobal('navigator', { language: 'ja-JP' } as unknown as Navigator);
      const { t } = await import('./i18n.js');
      expect(t('ui.resume')).toBe('レジューム');
      expect(t('ui.resumeNotification')).toBe('{page}ページから再開しますか？');
      expect(t('ui.continueReading')).toBe('続きから');
      expect(t('ui.startFromBeginning')).toBe('最初から');
    });
  });
});