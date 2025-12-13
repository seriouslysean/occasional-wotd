import { addBreadcrumb, captureException, captureMessage, withScope } from '@sentry/astro';

import type { LogContext } from '~types';

/**
 * Log an error to Sentry with optional context
 * @param {Error | string} error - Error object or message
 * @param {LogContext} [context={}] - Additional context for the log
 * @param {'error' | 'warning' | 'info'} [level='error'] - Severity level
 * @returns {void} Nothing
 */
export function logError(error: Error | string, context: LogContext = {}, level: 'error' | 'warning' | 'info' = 'error'): void {
  if (import.meta.env.SENTRY_ENABLED !== 'true') {
    return;
  }
  if (Object.keys(context).length > 0) {
    withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
      if (error instanceof Error) {
        captureException(error);
      } else {
        captureMessage(String(error), level);
      }
    });
  } else {
    if (error instanceof Error) {
      captureException(error);
    } else {
      captureMessage(String(error), level);
    }
  }
}

/**
 * Log a structured error to Sentry with use case identification
 * @param {string} useCase - Identifier for where the error occurred
 * @param {LogContext} [params={}] - Additional parameters for context
 * @param {Error} [error] - Original error instance
 * @param {'error' | 'warning' | 'info'} [level='error'] - Severity level
 * @returns {void} Nothing
 */
export function logSentryError(useCase: string, params: LogContext = {}, error?: Error, level: 'error' | 'warning' | 'info' = 'error'): void {
  const message = error instanceof Error ? error : `Error: ${useCase}`;
  logError(message, params, level);
}

/**
 * Add a navigation breadcrumb to Sentry
 * @param {string} from - Source location (current page)
 * @param {string} to - Destination URL
 * @param {LogContext} [data={}] - Additional context
 * @returns {void} Nothing
 */
export function addNavigationBreadcrumb(from: string, to: string, data: LogContext = {}): void {
  if (import.meta.env.SENTRY_ENABLED !== 'true') {
    return;
  }

  addBreadcrumb({
    type: 'navigation',
    category: 'navigation',
    message: `Navigating from ${from} to ${to}`,
    level: 'info',
    data: {
      from,
      to,
      ...data,
    },
  });
}

/**
 * Add a UI interaction breadcrumb to Sentry
 * @param {string} element - UI element identifier (e.g., "random-word-button")
 * @param {string} action - Action performed (e.g., "click", "submit")
 * @param {LogContext} [data={}] - Additional context
 * @returns {void} Nothing
 */
export function addUIBreadcrumb(element: string, action: string, data: LogContext = {}): void {
  if (import.meta.env.SENTRY_ENABLED !== 'true') {
    return;
  }

  addBreadcrumb({
    type: 'user',
    category: 'ui.interaction',
    message: `${action} on ${element}`,
    level: 'info',
    data: {
      element,
      action,
      ...data,
    },
  });
}

/**
 * Add a custom breadcrumb to Sentry
 * @param {string} category - Breadcrumb category
 * @param {string} message - Breadcrumb message
 * @param {LogContext} [data={}] - Additional context
 * @param {'debug' | 'info' | 'warning' | 'error'} [level='info'] - Severity level
 * @returns {void} Nothing
 */
export function addCustomBreadcrumb(
  category: string,
  message: string,
  data: LogContext = {},
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
): void {
  if (import.meta.env.SENTRY_ENABLED !== 'true') {
    return;
  }

  addBreadcrumb({
    category,
    message,
    level,
    data,
  });
}
