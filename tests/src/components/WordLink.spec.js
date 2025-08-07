import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

describe('WordLink Component Integration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('getWordUrl', () => {
    it('should return relative path without BASE_PATH processing', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getWordUrl } = await import('~utils-client/url-utils');
      expect(getWordUrl('serendipity')).toBe('/words/serendipity');
      expect(getWordUrl('ice cream')).toBe('/words/ice cream');
    });

    it('should return empty string for empty word', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getWordUrl } = await import('~utils-client/url-utils');
      expect(getWordUrl('')).toBe('');
    });

    it('should work regardless of BASE_PATH', async () => {
      vi.stubEnv('BASE_PATH', '/occasional-wotd');
      const { getWordUrl } = await import('~utils-client/url-utils');
      expect(getWordUrl('test')).toBe('/words/test');
    });
  });

  describe('WordLink + SiteLink integration flow', () => {
    it('should prevent double BASE_PATH with no subdirectory', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl, getWordUrl } = await import('~utils-client/url-utils');
      const rawPath = getWordUrl('serendipity');
      const processedUrl = getUrl(rawPath);
      expect(rawPath).toBe('/words/serendipity');
      expect(processedUrl).toBe('/words/serendipity');
    });

    it('should prevent double BASE_PATH with subdirectory', async () => {
      vi.stubEnv('BASE_PATH', '/occasional-wotd');
      const { getUrl, getWordUrl } = await import('~utils-client/url-utils');
      const rawPath = getWordUrl('serendipity');
      const processedUrl = getUrl(rawPath);
      expect(rawPath).toBe('/words/serendipity');
      expect(processedUrl).toBe('/occasional-wotd/words/serendipity');
      expect(processedUrl).not.toContain('/occasional-wotd/occasional-wotd/');
    });

    it('should handle multi-word phrases correctly', async () => {
      vi.stubEnv('BASE_PATH', '/occasional-wotd');
      const { getUrl, getWordUrl } = await import('~utils-client/url-utils');
      const rawPath = getWordUrl('ice cream');
      const processedUrl = getUrl(rawPath);
      expect(rawPath).toBe('/words/ice cream');
      expect(processedUrl).toBe('/occasional-wotd/words/ice cream');
    });

    it('should handle special characters in words', async () => {
      vi.stubEnv('BASE_PATH', '/occasional-wotd');
      const { getUrl, getWordUrl } = await import('~utils-client/url-utils');
      const rawPath = getWordUrl("don't");
      const processedUrl = getUrl(rawPath);
      expect(rawPath).toBe("/words/don't");
      expect(processedUrl).toBe("/occasional-wotd/words/don't");
    });
  });

  describe('Real-world GitHub Pages scenarios', () => {
    it('should match expected GitHub Pages URLs', async () => {
      vi.stubEnv('BASE_PATH', '/occasional-wotd');
      const { getUrl, getWordUrl } = await import('~utils-client/url-utils');
      const testCases = [
        { word: 'serendipity', expected: '/occasional-wotd/words/serendipity' },
        { word: 'ice cream', expected: '/occasional-wotd/words/ice cream' },
        { word: 'a', expected: '/occasional-wotd/words/a' },
        { word: 'occasional', expected: '/occasional-wotd/words/occasional' },
      ];

      for (const { word, expected } of testCases) {
        const rawPath = getWordUrl(word);
        const processedUrl = getUrl(rawPath);
        expect(processedUrl).toBe(expected);
      }
    });

    it('should work correctly for localhost development', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl, getWordUrl } = await import('~utils-client/url-utils');
      const rawPath = getWordUrl('test');
      const processedUrl = getUrl(rawPath);
      expect(rawPath).toBe('/words/test');
      expect(processedUrl).toBe('/words/test');
    });
  });
});
