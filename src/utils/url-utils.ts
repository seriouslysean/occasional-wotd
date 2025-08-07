import { env } from '~config/environment';
import { logger } from '~utils-client/logger';

/**
 * Construct a URL with the configured base path
 * Consistently enforces lowercase URLs and no trailing slashes except for root path
 * @param path - Path to normalize
 * @returns Normalized URL path
 */
export const getUrl = (path = '/'): string => {
  const baseUrl = env.BASE_PATH || '/';

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

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  if (normalizedPath.includes('.')) {
    return `${normalizedBase}${normalizedPath}`;
  }

  return `${normalizedBase}${normalizedPath.replace(/\/$/, '')}`;
};

/**
 * Get a normalized full URL including site URL and path
 * Uses getUrl() internally to ensure BASE_PATH is properly handled
 * @param path - Path to append to site URL
 * @returns Absolute URL
 */
export const getFullUrl = (path = '/'): string => {
  const siteUrl = env.SITE_URL.replace(/\/$/, '');
  const relativePath = getUrl(path);
  return `${siteUrl}${relativePath}`;
};

/**
 * Create a consistent, SEO-friendly internal link path for a word
 * @param {string} word - Word to build path for
 * @returns {string} Relative word path (without BASE_PATH)
 */
export const getWordUrl = (word: string): string => {
  return word ? `/words/${word}` : '';
};

