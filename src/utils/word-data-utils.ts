import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { getAdapter } from '~adapters/factory';
import type { DictionaryDefinition } from '~types/adapters';
import type {
  WordAdjacentResult,
  WordData,
  WordGroupByYearResult,
  WordProcessedData,
} from '~types/word';
import { logger } from '~utils/logger';
import { createMemoryCache, createWordDataProvider, type WordFileInfo } from '~utils/word-data-shared';

export type WordDataProvider = () => WordData[];

// Create file loader for Astro build environment
const createAstroFileLoader = () => (): WordFileInfo[] => {
  const loadFromDirectory = (dir: string): WordFileInfo[] => {
    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir, { recursive: true })
      .filter((file): file is string => typeof file === 'string' && file.endsWith('.json'))
      .map(file => path.join(dir, file));

    const result = files.map(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const date = fileName.match(/(\d{8})\.json$/)?.[1] || '';

      return {
        filePath,
        date,
        content,
      };
    });

    return result;
  };

  // Try production words first, then demo words
  const productionWords = loadFromDirectory(path.join(process.cwd(), 'data', 'words'));
  if (productionWords.length > 0) {
    return productionWords;
  }

  return loadFromDirectory(path.join(process.cwd(), 'data', 'demo', 'words'));
};

// Create the getAllWords function using shared logic
export const getAllWords = (() => {
  const provider = createWordDataProvider(
    createAstroFileLoader(),
    createMemoryCache(),
    'words',
  );
  return () => {
    const words = provider();
    return words.sort((a, b) => b.date.localeCompare(a.date));
  };
})();

/**
 * Fetches word data from the configured dictionary adapter and transforms it to our internal format.
 * Uses the current date if no date is provided.
 *
 * @param {string} word - The word to fetch dictionary data for
 * @param {Record<string, unknown>} options - Additional options to pass to the adapter
 * @param {string} [date] - Optional date in YYYYMMDD format; defaults to current date
 * @returns {Promise<WordData>} Promise resolving to transformed word data in our internal format
 */
export async function fetchWordFromAdapter(word: string, options: Record<string, unknown> = {}, date?: string): Promise<WordData> {
  const adapter = getAdapter();
  const response = await adapter.fetchWordData(word, options);
  return adapter.transformToWordData(response, date || new Date().toISOString().slice(0,10).replace(/-/g, ''));
}

/**
 * Processes raw word data into a standardized format for display.
 * Extracts part of speech, definition, and metadata using the current adapter.
 *
 * @param {WordData} wordData - Raw word data containing dictionary definitions
 * @returns {WordProcessedData} Processed word data with standardized fields for UI consumption
 */
export function getProcessedWord(wordData: WordData): WordProcessedData {
  const adapter = getAdapter();
  return adapter.transformWordData(wordData);
}

/**
 * Retrieves the current word that should be displayed based on today's date.
 * Returns the most recent word with a date less than or equal to today.
 * Falls back to the first available word if none match the date criteria.
 *
 * @param {WordDataProvider} [wordProvider=getAllWords] - Function that provides word data array
 * @returns {WordData | null} The current word data that should be displayed, or null if no words are available
 */
export const getCurrentWord = (wordProvider: WordDataProvider = getAllWords): WordData | null => {
  const words = wordProvider();
  if (!words.length) {
    logger.error('No word data available in the system');
    return null;
  }

  const today = new Date();
  const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');
  const found = words.find(word => word.date <= dateString) || words[0];
  return found;
};

/**
 * Retrieves up to 5 words that occurred before the specified date.
 * Useful for showing recent word history or navigation context.
 *
 * @param {string} currentDate - Reference date in YYYYMMDD format to find words before
 * @param {WordDataProvider} [wordProvider=getAllWords] - Function that provides word data array
 * @returns {WordData[]} Array of up to 5 word entries that occurred before the given date
 */
export const getPastWords = (currentDate: string, wordProvider: WordDataProvider = getAllWords): WordData[] => {
  if (!currentDate) {
    return [];
  }
  const words = wordProvider();
  return words
    .filter(word => word.date < currentDate)
    .slice(0, 5);
};

/**
 * Finds and returns the word data for a specific date.
 * Returns null if no word exists for the given date or if date is invalid.
 *
 * @param {string} date - Date to search for in YYYYMMDD format
 * @param {WordDataProvider} [wordProvider=defaultWordDataProvider] - Function that provides word data array
 * @returns {WordData | null} Word data for the specified date, or null if not found
 */
export const getWordByDate = (date: string, wordProvider: WordDataProvider = getAllWords): WordData | null => {
  if (!date) {
    return null;
  }
  const words = wordProvider();
  return words.find(word => word.date === date) || null;
};

/**
 * Gets the previous and next words relative to the given date for navigation purposes.
 * Previous word has an earlier date, next word has a later date.
 *
 * @param {string} date - Reference date in YYYYMMDD format to find adjacent words for
 * @param {WordDataProvider} [wordProvider=defaultWordDataProvider] - Function that provides word data array
 * @returns {WordAdjacentResult} Object containing previousWord and nextWord, or null if not found
 */
export const getAdjacentWords = (date: string, wordProvider: WordDataProvider = getAllWords): WordAdjacentResult => {
  if (!date) {
    return {
      previousWord: null,
      nextWord: null,
    };
  }
  const words = wordProvider();
  const currentIndex = words.findIndex(word => word.date === date);

  if (currentIndex === -1) {
    return {
      previousWord: null,
      nextWord: null,
    };
  }

  return {
    previousWord: words[currentIndex + 1] || null,
    nextWord: words[currentIndex - 1] || null,
  };
};

/**
 * Safely extracts and processes word details from raw word data.
 * Handles cases where word data might be incomplete or malformed.
 *
 * @param {WordData} word - Raw word data containing dictionary definitions
 * @returns {WordProcessedData} Processed word details with safe defaults for missing data
 */
export const getWordDetails = (word: WordData): WordProcessedData => {
  if (!word?.data) {
    return { partOfSpeech: '', definition: '', meta: null };
  }

  return getProcessedWord(word);
};

/**
 * Retrieves all words that occurred within a specific year.
 * Useful for generating yearly statistics or archives.
 *
 * @param {string} year - Year to filter by (YYYY format)
 * @param {WordDataProvider} [wordProvider=defaultWordDataProvider] - Function that provides word data array
 * @returns {WordData[]} Array of word data entries from the specified year
 */
export const getWordsByYear = (year: string, wordProvider: WordDataProvider = getAllWords): WordData[] => {
  const words = wordProvider();
  return words.filter(word => word.date.startsWith(year));
};

/**
 * Generates a SHA-256 hash from a list of words and their count.
 * Useful for creating cache keys or detecting changes in word datasets.
 * Words are sorted alphabetically before hashing to ensure consistent results.
 *
 * @param {string[]} words - Array of word strings to hash
 * @returns {string} SHA-256 hash in hexadecimal format
 */
export const generateWordDataHash = (words: string[]): string => {
  const sorted = [...words].sort();
  const input = `${sorted.length}:${sorted.join(',')}`;
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Groups an array of word data by year for organizing and statistical analysis.
 * Creates an object where keys are years (YYYY) and values are arrays of words from that year.
 *
 * @param {WordData[]} words - Array of word data to group by year
 * @returns {WordGroupByYearResult} Object with years as keys and word arrays as values
 */
export const groupWordsByYear = (words: WordData[]): WordGroupByYearResult => {
  return words.reduce((acc, word) => {
    const year = word.date.substring(0, 4);
    acc[year] = acc[year] || [];
    acc[year].push(word);
    return acc;
  }, {} as WordGroupByYearResult);
};

/**
 * Retrieves a list of all years that have word data available.
 * Returns years in descending order (newest first) for UI display purposes.
 *
 * @param {WordDataProvider} [wordProvider=defaultWordDataProvider] - Function that provides word data array
 * @returns {string[]} Array of unique years (YYYY format) sorted in descending order
 */
export const getAvailableYears = (wordProvider: WordDataProvider = getAllWords): string[] => {
  const words = wordProvider();
  const years = [...new Set(words.map(word => word.date.substring(0, 4)))];
  return years.sort((a, b) => b.localeCompare(a));
};

/**
 * Validates if dictionary definition data contains valid word information.
 * Checks for presence of definition text or part of speech in at least one entry.
 * Generic validation that works with any adapter's data format.
 *
 * @param {DictionaryDefinition[]} data - Array of dictionary definitions to validate
 * @returns {boolean} True if the data contains at least one valid definition entry
 */
export function isValidDictionaryData(data: DictionaryDefinition[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  // Valid if at least one entry has definition text or part of speech
  return data.some(entry =>
    (typeof entry.text === 'string' && entry.text.trim().length > 0) ||
    (typeof entry.partOfSpeech === 'string' && entry.partOfSpeech.trim().length > 0),
  );
}
