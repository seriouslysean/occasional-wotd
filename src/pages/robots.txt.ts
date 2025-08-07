import type { APIRoute } from 'astro';

import { env } from '~config/environment';
import { generateRobotsTxt } from '~utils-client/static-file-utils';

/**
 * Handle robots.txt requests
 * @returns Plain text robots.txt content
 */
export const GET: APIRoute = () => {
  const robotsTxt = generateRobotsTxt(env.SITE_URL);

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
