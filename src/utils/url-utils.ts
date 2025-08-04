import { logger } from '~utils/logger';

const PLACEHOLDER_ORIGIN = 'http://placeholder';

/**
 * Constructs a URL with the base URL if configured.
 * Normalizes trailing slashes except for the root path.
 */
export const getUrl = (path = '/'): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const siteUrl = import.meta.env.SITE_URL || PLACEHOLDER_ORIGIN;

  if (!path || path === '') {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  if (path === '/') {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  if (/\/\/+/.test(path)) {
    logger.error('Invalid path contains multiple consecutive slashes', { path });
    throw new Error('Invalid path: contains multiple consecutive slashes');
  }

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const joined = new URL(
    path.replace(/^\//, ''),
    new URL(base, siteUrl),
  ).pathname;

  return joined.includes('.') ? joined : joined.replace(/\/$/, '');
};

/**
 * Gets a normalized full URL including site URL and path.
 * Uses {@link getUrl} for path resolution.
 */
export const getFullUrl = (path = '/'): string => {
  const siteUrl = import.meta.env.SITE_URL;
  const url = new URL(getUrl(path), siteUrl);

  if (!path || path === '/') {
    const full = url.toString();
    return full.endsWith('/') ? full : `${full}/`;
  }

  return url.toString().replace(/\/$/, '');
};

/**
 * Creates a consistent, SEO-friendly internal link URL
 */
export const getWordUrl = (word: string): string => {
  return word ? getUrl(`/${word}`) : '';
};

/**
 * Creates a consistent, SEO-friendly date-based link URL
 */
export const getDateUrl = (date: string): string => {
  return date ? getUrl(`/${date}`) : '';
};
