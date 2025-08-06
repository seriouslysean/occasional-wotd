/**
 * Base stats definition supporting both static and dynamic descriptions
 */
export interface StatsDefinition {
  title: string;
  pageDescription: string | ((arg?: string | number) => string);
  metaDescription: (count: number, arg?: string) => string;
  category: 'stats';
}

/**
 * Stats definition variant requiring dynamic descriptions
 */
export type DynamicStatsDefinition = StatsDefinition & {
  pageDescription: (arg?: string | number) => string;
};

/**
 * Available word suffix patterns
 */
export type SuffixKey = 'ed' | 'ing' | 'ly' | 'ness' | 'ful' | 'less';

/**
 * All available stats page slugs (consolidated from StatsDefinitionKey and StatsSlug)
 */
export type StatsSlug =
  // Letter patterns
  | 'alphabetical-order'
  | 'double-letters'
  | 'triple-letters'
  | 'same-start-end'
  | 'palindromes'
  // Word patterns
  | 'all-consonants'
  | 'all-vowels'
  // Dynamic stats
  | 'most-common-letter'
  | 'least-common-letter'
  | 'milestone-words'
  | 'current-streak'
  | 'longest-streak'
  // Word endings
  | 'words-ending-ed'
  | 'words-ending-ing'
  | 'words-ending-ly'
  | 'words-ending-ness'
  | 'words-ending-ful'
  | 'words-ending-less';

/**
 * Template type for suffix-based stats slugs
 */
export type SuffixStatsSlug = `words-ending-${SuffixKey}`;

/**
 * Type aliases for backward compatibility
 */
export type SuffixDefinition = StatsDefinition;
export type LetterPatternDefinition = StatsDefinition;
export type PatternDefinition = StatsDefinition;

