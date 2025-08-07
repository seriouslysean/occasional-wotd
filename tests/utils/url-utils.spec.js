import {
 beforeEach, describe, expect, it, vi,
} from 'vitest';

describe('utils', () => {
  describe('getUrl', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('handles paths with default base path', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/20240319')).toBe('/20240319');
    });

    it('handles paths with custom base path', async () => {
      vi.stubEnv('BASE_PATH', '/blog');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/20240319')).toBe('/blog/20240319');
    });

    it('handles paths with custom base path with trailing slash', async () => {
      vi.stubEnv('BASE_PATH', '/blog/');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/20240319')).toBe('/blog/20240319');
    });

    it('handles empty or undefined base path', async () => {
      vi.stubEnv('BASE_PATH', '');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/20240319')).toBe('/20240319');
    });

    it('handles empty paths', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('')).toBe('/');
      expect(getUrl('/')).toBe('/');
    });

    it('handles null or undefined paths', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl(null)).toBe('/');
      expect(getUrl(undefined)).toBe('/');
    });

    it('rejects paths with multiple consecutive slashes', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(() => getUrl('//20240319')).toThrow('Invalid path: contains multiple consecutive slashes');
      expect(() => getUrl('///20240319')).toThrow('Invalid path: contains multiple consecutive slashes');
    });

    it('preserves trailing slashes for root path only', async () => {
      vi.stubEnv('BASE_PATH', '/');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/')).toBe('/');
      expect(getUrl('/20240319/')).toBe('/20240319');
    });

    it('ignores SITE_URL when building relative URLs', async () => {
      vi.stubEnv('BASE_PATH', '/blog');
      vi.stubEnv('SITE_URL', 'https://example.com');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/words/hello')).toBe('/blog/words/hello');
    });

    it('preserves case for base path and path', async () => {
      vi.stubEnv('BASE_PATH', '/Blog');
      const { getUrl } = await import('~utils-client/url-utils');
      expect(getUrl('/ABC')).toBe('/Blog/ABC');
    });
  });

  describe('getFullUrl', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('combines SITE_URL with getUrl() result', async () => {
      vi.stubEnv('BASE_PATH', '/');
      vi.stubEnv('SITE_URL', 'https://example.com');
      const { getFullUrl } = await import('~utils-client/url-utils');
      expect(getFullUrl('/words/hello')).toBe('https://example.com/words/hello');
    });

    it('handles subdirectory deployments correctly', async () => {
      vi.stubEnv('BASE_PATH', '/vocab');
      vi.stubEnv('SITE_URL', 'https://example.com');
      const { getFullUrl } = await import('~utils-client/url-utils');
      expect(getFullUrl('/words/hello')).toBe('https://example.com/vocab/words/hello');
    });

    it('handles root path correctly', async () => {
      vi.stubEnv('BASE_PATH', '/');
      vi.stubEnv('SITE_URL', 'https://example.com');
      const { getFullUrl } = await import('~utils-client/url-utils');
      expect(getFullUrl('/')).toBe('https://example.com/');
    });

    it('removes trailing slash from SITE_URL', async () => {
      vi.stubEnv('BASE_PATH', '/');
      vi.stubEnv('SITE_URL', 'https://example.com/');
      const { getFullUrl } = await import('~utils-client/url-utils');
      expect(getFullUrl('/test')).toBe('https://example.com/test');
    });
  });
});
