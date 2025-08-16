/**
 * Breadcrumb generation utilities
 * Generates breadcrumb navigation data from URL pathnames
 */

import { getPageMetadata } from '~utils/page-metadata-utils';
import { stripBasePath } from '~astro-utils/url-utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Generate breadcrumb items from a URL pathname
 * @param pathname - The URL pathname to parse
 * @returns Array of breadcrumb items with labels and hrefs
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathWithoutBase = stripBasePath(pathname);

  if (!pathWithoutBase || pathWithoutBase === 'home') {
    return [];
  }

  const segments = pathWithoutBase.split('/').filter(Boolean);
  
  // Build breadcrumbs progressively
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'home', href: '/' }
  ];
  
  segments.reduce((path, segment) => {
    const nextPath = `${path}/${segment}`;
    const metadata = getPageMetadata(nextPath);
    
    breadcrumbs.push({
      label: metadata?.title?.toLowerCase() || segment,
      href: nextPath
    });
    
    return nextPath;
  }, '');
  
  return breadcrumbs;
}