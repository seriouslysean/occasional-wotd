import type { WordData } from '~types/word';

/**
 * Get social media image URL for a word or page
 * @param params - Pathname and optional word data
 * @returns URL to the social image
 */
export function getSocialImageUrl({ pathname, wordData }: { pathname: string; wordData?: WordData | null }): string {
  const basePath = import.meta.env.BASE_PATH || '/';
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  if (wordData && wordData.word) {
    // Word-specific social image
    return `${basePath}images/social/${import.meta.env.SOURCE_DIR || 'demo'}/2025/${wordData.date}-${wordData.word}.png`;
  }

  if (cleanPath.startsWith('words/')) {
    // Word path without specific data
    const wordPath = cleanPath.replace('words/', '');
    return `${basePath}images/social/${import.meta.env.SOURCE_DIR || 'demo'}/2025/${wordPath}.png`;
  }

  // Generic page social image
  return `${basePath}images/social/pages/${cleanPath || 'index'}.png`;
}

/**
 * Get static pages for image generation
 * @returns Metadata for all static pages
 */
export async function getStaticPages() {
  const { getAllPageMetadata } = await import('~utils-client/page-metadata');
  return getAllPageMetadata();
}

/**
 * Get cat image URL for a word
 * @param word - Word of the day
 * @returns URL to the cat image
 */
export function getCatImageUrl(word: string): string {
  const baseUrl = (import.meta.env.CAT_IMAGE_BASE_URL || 'https://cataas.com/cat/says').replace(/\/$/, '');
  return `${baseUrl}/${encodeURIComponent(word)}`;
}