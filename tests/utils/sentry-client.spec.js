import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

// Mock @sentry/astro before importing the module under test
vi.mock('@sentry/astro', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  withScope: vi.fn((callback) => {
    const scope = {
      setLevel: vi.fn(),
      setExtra: vi.fn(),
    };
    callback(scope);
    return scope;
  }),
}));

import { captureException, captureMessage, withScope } from '@sentry/astro';

describe('sentry-client', () => {
  let logError;
  let logSentryError;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when SENTRY_ENABLED is false', () => {
    beforeEach(async () => {
      vi.stubEnv('SENTRY_ENABLED', 'false');
      const mod = await import('#astro-utils/sentry-client');
      logError = mod.logError;
      logSentryError = mod.logSentryError;
    });

    it('logError does not call Sentry APIs', () => {
      logError(new Error('test'), { key: 'value' });
      expect(withScope).not.toHaveBeenCalled();
      expect(captureException).not.toHaveBeenCalled();
      expect(captureMessage).not.toHaveBeenCalled();
    });

    it('logSentryError does not call Sentry APIs', () => {
      logSentryError('test-case', { key: 'value' }, new Error('err'));
      expect(withScope).not.toHaveBeenCalled();
    });
  });

  describe('when SENTRY_ENABLED is true', () => {
    beforeEach(async () => {
      vi.stubEnv('SENTRY_ENABLED', 'true');
      const mod = await import('#astro-utils/sentry-client');
      logError = mod.logError;
      logSentryError = mod.logSentryError;
    });

    it('captures Error objects with captureException', () => {
      const error = new Error('test error');
      logError(error);

      expect(withScope).toHaveBeenCalledOnce();
      expect(captureException).toHaveBeenCalledWith(error);
    });

    it('captures string messages with captureMessage', () => {
      logError('something went wrong');

      expect(withScope).toHaveBeenCalledOnce();
      expect(captureMessage).toHaveBeenCalledWith('something went wrong', 'error');
    });

    it('sets severity level on scope', () => {
      logError('warning msg', {}, 'warning');

      const scopeCallback = withScope.mock.calls[0][0];
      const scope = { setLevel: vi.fn(), setExtra: vi.fn() };
      scopeCallback(scope);
      expect(scope.setLevel).toHaveBeenCalledWith('warning');
    });

    it('attaches context as extras on scope', () => {
      logError(new Error('err'), { foo: 'bar', count: 42 });

      const scopeCallback = withScope.mock.calls[0][0];
      const scope = { setLevel: vi.fn(), setExtra: vi.fn() };
      scopeCallback(scope);
      expect(scope.setExtra).toHaveBeenCalledWith('foo', 'bar');
      expect(scope.setExtra).toHaveBeenCalledWith('count', 42);
    });

    it('logSentryError includes useCase in context', () => {
      logSentryError('fetch-word', { word: 'test' }, new Error('fail'));

      const scopeCallback = withScope.mock.calls[0][0];
      const scope = { setLevel: vi.fn(), setExtra: vi.fn() };
      scopeCallback(scope);
      expect(scope.setExtra).toHaveBeenCalledWith('useCase', 'fetch-word');
      expect(scope.setExtra).toHaveBeenCalledWith('word', 'test');
    });

    it('logSentryError falls back to message when no error provided', () => {
      logSentryError('missing-data', { key: 'val' });

      expect(captureMessage).toHaveBeenCalledWith('Error: missing-data', 'error');
    });
  });
});
