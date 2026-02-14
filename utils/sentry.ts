/**
 * Pure Node.js Sentry utilities for CLI tools.
 * Uses @sentry/node directly -- no Astro dependencies.
 *
 * Reads SENTRY_DSN and SENTRY_ENVIRONMENT from process.env.
 * If SENTRY_ENABLED is not 'true' or SENTRY_DSN is missing, all
 * operations are safe no-ops.
 */
import * as Sentry from '@sentry/node';

import type { LogContext } from '#types';

const isEnabled = process.env.SENTRY_ENABLED === 'true' && !!process.env.SENTRY_DSN;

let initialized = false;

/**
 * Lazily initializes the Sentry Node SDK the first time it is needed.
 * Safe to call multiple times -- subsequent calls are no-ops.
 */
function ensureInitialized(): void {
  if (initialized || !isEnabled) {
    return;
  }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || 'development',
    release: process.env.SENTRY_RELEASE || undefined,
    tracesSampleRate: 0,
    initialScope: {
      tags: {
        site: process.env.SITE_ID || 'unknown',
        runtime: 'cli',
      },
    },
  });
  initialized = true;
}

/**
 * Sends an error or message to Sentry with optional context.
 * Mirrors the Astro sentry-client API so call sites look the same.
 */
export function logError(error: Error | string, context: LogContext = {}, level: 'error' | 'warning' | 'info' = 'error'): void {
  if (!isEnabled) {
    return;
  }
  ensureInitialized();

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    for (const [key, value] of Object.entries(context)) {
      scope.setExtra(key, value);
    }
    if (error instanceof Error) {
      Sentry.captureException(error);
    } else {
      Sentry.captureMessage(String(error), level);
    }
  });
}

/**
 * Wraps an entire CLI tool execution with Sentry error capture.
 * Automatically flushes events before the process exits.
 *
 * @param toolName - Human-readable tool name used as a Sentry tag
 * @param fn - The async function containing the tool's main logic
 */
export async function withSentry(toolName: string, fn: () => Promise<void>): Promise<void> {
  if (!isEnabled) {
    await fn();
    return;
  }
  ensureInitialized();
  Sentry.setTag('tool', toolName);

  try {
    await fn();
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  } finally {
    // Give Sentry up to 2 seconds to flush queued events before exit
    await Sentry.flush(2000);
  }
}
