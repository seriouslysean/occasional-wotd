import { logger } from '~utils/logger';

const DEFAULT_SITE_URL = 'http://localhost:4321';

/**
 * Constructs a URL with the base URL if configured.
 * Normalizes trailing slashes except for the root path.
 */
export const getUrl = (path = '/'): string => {
  const baseUrl = import.meta.env.BASE_URL || '/';

  if (!path || path === '/') {
    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  if (path.includes('//')) {
    logger.error('Invalid path contains multiple consecutive slashes', { path });
    throw new Error('Invalid path: contains multiple consecutive slashes');
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath.replace(/\/$/, '')}`;
};

/**
 * Gets a normalized full URL including site URL and path.
 * Uses {@link getUrl} for path resolution.
 */
export const getFullUrl = (path = '/'): string => {
  const siteUrl = import.meta.env.SITE_URL || DEFAULT_SITE_URL;

  if (!path) {
    const base = new URL(siteUrl);
    const fullBase = base.toString();
    return fullBase.endsWith('/') ? fullBase : `${fullBase}/`;
  }

  try {
    const url = new URL(getUrl(path), siteUrl);
    return path === '/' ? url.toString() : url.toString().replace(/\/$/, '');
  } catch (error) {
    logger.error('Failed to construct URL with SITE_URL', {
      siteUrl,
      error: (error as Error).message,
    });
    throw new Error('SITE_URL environment variable is not a valid URL');
  }
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
