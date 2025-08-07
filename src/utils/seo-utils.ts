/**
 * @fileoverview SEO configuration and utilities
 * Centralized SEO config following Astro best practices
 */

import { env } from '~config/environment';
import type { SeoConfig, SeoMetadata, SeoMetadataOptions, SeoMetaDescriptionOptions } from '~types/seo';
import { getFullUrl } from '~utils-client/url-utils';

// SEO configuration using environment variables - no fallbacks for security
export const seoConfig: SeoConfig = {
  defaultTitle: env.SITE_TITLE,
  defaultDescription: env.SITE_DESCRIPTION,
  siteName: env.SITE_ID,
  locale: env.SITE_LOCALE,
  author: env.SITE_AUTHOR,
  authorUrl: env.SITE_AUTHOR_URL,
  attributionMessage: env.SITE_ATTRIBUTION_MESSAGE,
  keywords: env.SITE_KEYWORDS,
};


/**
 * Generate page-specific meta description
 * @param {SeoMetaDescriptionOptions} [options={}] - Description options
 * @returns {string} Generated meta description
 */
export function getMetaDescription(options: SeoMetaDescriptionOptions = {}): string {
  const { word, definition, custom } = options;
  if (custom) {
return custom;
}

  if (word && definition) {
    // Truncate definition to ~150 chars for meta description (2025 best practice)
    const shortDef = definition.length > 100
      ? definition.substring(0, 100).trim() + '...'
      : definition;
    return `${word}: ${shortDef} | ${seoConfig.siteName}`;
  }

  return seoConfig.defaultDescription;
}

/**
 * Generate basic SEO metadata for a page
 * @param {SeoMetadataOptions} param0 - Metadata options
 * @returns {SeoMetadata} SEO metadata object
 */
export function generateSeoMetadata({ title, description, pathname, keywords = [] }: SeoMetadataOptions): SeoMetadata {
  const pageTitle = title ? `${title} - ${seoConfig.siteName}` : seoConfig.defaultTitle;
  const pageDescription = description || seoConfig.defaultDescription;
  const url = getFullUrl(pathname);
  const combinedKeywords = [...seoConfig.keywords, ...keywords].join(', ');

  return {
    title: pageTitle,
    description: pageDescription,
    canonical: url,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: seoConfig.siteName,
      locale: seoConfig.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: seoConfig.siteName,
    },
    keywords: combinedKeywords,
  };
}
