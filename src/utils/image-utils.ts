import type { WordData } from '~types';
import { getUrl } from '~astro-utils/url-utils';

/**
 * Get social media image URL for a word or page
 * @param params - Pathname and optional word data
 * @returns URL to the social image
 */
export function getSocialImageUrl({ pathname, wordData }: { pathname: string; wordData?: WordData | null }): string {
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  if (wordData && wordData.word) {
    return getUrl(
      `images/social/${import.meta.env.SOURCE_DIR || 'demo'}/2025/${wordData.date}-${wordData.word}.png`,
    );
  }

  if (cleanPath.startsWith('words/')) {
    const wordPath = cleanPath.replace('words/', '');
    return getUrl(`images/social/${import.meta.env.SOURCE_DIR || 'demo'}/2025/${wordPath}.png`);
  }

  return getUrl(`images/social/pages/${cleanPath || 'index'}.png`);
}

/**
 * Get static pages for image generation
 * @returns Metadata for all static pages
 */
export async function getStaticPages() {
  const { getAllPageMetadata } = await import('~astro-utils/page-metadata');
  return getAllPageMetadata();
}