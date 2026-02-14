import { captureException, captureMessage, withScope } from '@sentry/astro';

import type { LogContext } from '#types';

type SeverityLevel = 'error' | 'warning' | 'info';

/**
 * Sends an error or message to Sentry with optional context
 * @param error - Error object or message string
 * @param context - Additional key-value context attached as extras
 * @param level - Severity level applied to both exceptions and messages
 */
export function logError(error: Error | string, context: LogContext = {}, level: SeverityLevel = 'error'): void {
  if (import.meta.env.SENTRY_ENABLED !== 'true') {
    return;
  }

  withScope((scope) => {
    scope.setLevel(level);

    for (const [key, value] of Object.entries(context)) {
      scope.setExtra(key, value);
    }

    if (error instanceof Error) {
      captureException(error);
    } else {
      captureMessage(String(error), level);
    }
  });
}

/**
 * Sends a structured error to Sentry identified by use case
 * @param useCase - Identifier for where the error occurred
 * @param params - Additional parameters attached as extras
 * @param error - Original error instance (falls back to a message if absent)
 * @param level - Severity level
 */
export function logSentryError(useCase: string, params: LogContext = {}, error?: Error, level: SeverityLevel = 'error'): void {
  const message = error instanceof Error ? error : `Error: ${useCase}`;
  logError(message, { useCase, ...params }, level);
}
