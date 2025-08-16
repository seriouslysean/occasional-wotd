import type { APIRoute } from 'astro';

import { allWords } from '~astro-utils/word-data-utils';

/**
 * Handle word list requests
 * @returns JSON array of all words
 */
export const GET: APIRoute = () => {
  const wordNames: string[] = allWords.map(({ word }) => word);

  return new Response(JSON.stringify(wordNames), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

