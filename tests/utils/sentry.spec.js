import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

// Mock @sentry/node before importing
vi.mock('@sentry/node', () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setTag: vi.fn(),
  flush: vi.fn().mockResolvedValue(true),
  withScope: vi.fn((callback) => {
    const scope = {
      setLevel: vi.fn(),
      setExtra: vi.fn(),
    };
    callback(scope);
    return scope;
  }),
}));

describe('utils/sentry (Node.js CLI utility)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('when SENTRY_ENABLED is false', () => {
    it('logError is a no-op', async () => {
      vi.stubEnv('SENTRY_ENABLED', 'false');
      const { logError } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');

      logError(new Error('test'));
      expect(Sentry.withScope).not.toHaveBeenCalled();
    });

    it('withSentry runs the function without initializing Sentry', async () => {
      vi.stubEnv('SENTRY_ENABLED', 'false');
      const { withSentry } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');
      const fn = vi.fn().mockResolvedValue(undefined);

      await withSentry('test-tool', fn);

      expect(fn).toHaveBeenCalledOnce();
      expect(Sentry.init).not.toHaveBeenCalled();
    });
  });

  describe('when SENTRY_ENABLED is true with DSN', () => {
    beforeEach(() => {
      vi.stubEnv('SENTRY_ENABLED', 'true');
      vi.stubEnv('SENTRY_DSN', 'https://test@sentry.io/123');
      vi.stubEnv('SENTRY_ENVIRONMENT', 'test');
      vi.stubEnv('SITE_ID', 'test-site');
    });

    it('logError initializes Sentry and captures exceptions', async () => {
      const { logError } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');
      const err = new Error('test');

      logError(err, { tool: 'add-word' });

      expect(Sentry.init).toHaveBeenCalledOnce();
      expect(Sentry.withScope).toHaveBeenCalledOnce();
      expect(Sentry.captureException).toHaveBeenCalledWith(err);
    });

    it('logError captures string messages', async () => {
      const { logError } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');

      logError('something failed', {}, 'warning');

      expect(Sentry.captureMessage).toHaveBeenCalledWith('something failed', 'warning');
    });

    it('withSentry sets tool tag and flushes on success', async () => {
      const { withSentry } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');
      const fn = vi.fn().mockResolvedValue(undefined);

      await withSentry('add-word', fn);

      expect(Sentry.setTag).toHaveBeenCalledWith('tool', 'add-word');
      expect(fn).toHaveBeenCalledOnce();
      expect(Sentry.flush).toHaveBeenCalledWith(2000);
    });

    it('withSentry captures and re-throws errors', async () => {
      const { withSentry } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');
      const err = new Error('boom');
      const fn = vi.fn().mockRejectedValue(err);

      await expect(withSentry('broken-tool', fn)).rejects.toThrow('boom');
      expect(Sentry.captureException).toHaveBeenCalledWith(err);
      expect(Sentry.flush).toHaveBeenCalledWith(2000);
    });

    it('only initializes Sentry once across multiple calls', async () => {
      const { logError } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');

      logError(new Error('first'));
      logError(new Error('second'));

      expect(Sentry.init).toHaveBeenCalledOnce();
    });
  });

  describe('when SENTRY_ENABLED is true but DSN is missing', () => {
    it('logError is a no-op', async () => {
      vi.stubEnv('SENTRY_ENABLED', 'true');
      vi.stubEnv('SENTRY_DSN', '');
      const { logError } = await import('#utils/sentry');
      const Sentry = await import('@sentry/node');

      logError(new Error('test'));
      expect(Sentry.init).not.toHaveBeenCalled();
    });
  });
});
