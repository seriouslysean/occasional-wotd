import { describe, expect, it, vi } from 'vitest';

import { getCatImageUrl } from '~utils-client/image-utils';

describe('utils', () => {
  describe('getCatImageUrl', () => {
    it('returns default cat image url', () => {
      vi.stubEnv('CAT_IMAGE_BASE_URL', '');
      expect(getCatImageUrl('hello world')).toBe('https://cataas.com/cat/says/hello%20world');
    });

    it('uses custom base url from environment', () => {
      vi.stubEnv('CAT_IMAGE_BASE_URL', 'https://example.com/cat');
      expect(getCatImageUrl('test')).toBe('https://example.com/cat/test');
    });
  });
});

