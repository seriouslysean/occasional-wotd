import fs from 'fs';
import path from 'path';

import { paths } from '~config/paths';
import { COMMON_ENV_DOCS,showHelp } from '~tools/help-utils';
import { createWordEntry, findExistingWord } from '~tools/utils';
import type { WordData } from '~types';
import { getTodayYYYYMMDD, isValidDate } from '~utils/date-utils';

/**
 * Checks if a file exists for the given date and returns the existing word if found
 * @param date - Date in YYYYMMDD format
 * @returns Existing word data if found, null otherwise
 */
const checkExistingWord = (date: string): WordData | null => {
  const year = date.slice(0, 4);
  const filePath = path.join(paths.words, year, `${date}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return data as WordData;
    } catch (error) {
      console.error('Failed to read existing word file', { filePath, error: (error as Error).message });
    }
  }
  return null;
};

/**
 * Validates that a date is not in the future
 * @param date - Date string in YYYYMMDD format
 * @returns Whether the date is today or in the past
 */
const isNotFutureDate = (date: string): boolean => {
  const today = getTodayYYYYMMDD();
  return today ? date <= today : false;
};




/**
 * Adds a new word to the collection
 * @param input - Word to add
 * @param date - Date to add word for (defaults to today)
 * @param overwrite - Whether to overwrite existing word
 * @param preserveCase - Whether to preserve original capitalization
 */
async function addWord(input: string, date: string, overwrite: boolean = false, preserveCase: boolean = false): Promise<void> {
  try {
    const word = input?.trim();

    // Validate inputs
    if (!word) {
      console.error('Word is required', { providedInput: input });
      process.exit(1);
    }

    if (date && !isValidDate(date)) {
      console.error('Invalid date format', { providedDate: date, expectedFormat: 'YYYYMMDD' });
      process.exit(1);
    }

    // If no date provided, use today (local timezone)
    const targetDate = date || getTodayYYYYMMDD();

    // Validate that date is not in the future
    if (!isNotFutureDate(targetDate)) {
      console.error('Cannot add words for future dates', {
        requestedDate: targetDate,
        currentDate: getTodayYYYYMMDD(),
      });
      process.exit(1);
    }

    // Optimized check: Single pass to find if word exists globally
    // This replaces separate checks for date and word existence
    const existingWordByName = findExistingWord(word);

    if (existingWordByName) {
      // Word exists somewhere in the system
      if (existingWordByName.date === targetDate) {
        // Word exists for the same date
        if (!overwrite) {
          console.error('Word already exists for this date', {
            date: existingWordByName.date,
            existingWord: existingWordByName.word,
          });
          process.exit(1);
        }
        // If overwrite is true, we'll proceed to overwrite
      } else {
        // Word exists for a different date - always enforce global uniqueness
        console.error('Word already exists for different date', {
          word: word,
          existingDate: existingWordByName.date,
          requestedDate: targetDate,
        });
        process.exit(1);
      }
    } else if (!overwrite) {
      // Word doesn't exist globally, but check if a different word exists for the target date
      const existingForDate = checkExistingWord(targetDate);
      if (existingForDate) {
        console.error('A different word already exists for this date', {
          date: targetDate,
          existingWord: existingForDate.word,
        });
        process.exit(1);
      }
    }

    // Use shared word creation logic
    await createWordEntry(word, targetDate, overwrite, preserveCase);

  } catch (error) {
    if (error.message.includes('not found in dictionary')) {
      console.error('Word not found in dictionary', { word, errorMessage: error.message });
    } else {
      console.error('Failed to add word', { word, errorMessage: error.message });
    }
    process.exit(1);
  }
}

const HELP_TEXT = `
Add Word Tool

Adds a new word to the collection with automatic dictionary lookup and validation.
Enforces global word uniqueness and prevents future-dated entries.

Usage:
  npm run tool:local tools/add-word.ts <word> [date] [options]
  npm run tool:add-word <word> [date] [options]

Arguments:
  word    The word to add (required)
  date    Date in YYYYMMDD format (optional, defaults to today)

Options:
  -o, --overwrite       Overwrite existing word for the same date
  -p, --preserve-case   Preserve original capitalization (default: converts to lowercase)
  -h, --help            Show this help message

Examples:
  npm run tool:add-word "serendipity"
  npm run tool:add-word "ephemeral" "20240116"
  npm run tool:add-word "ubiquitous" --overwrite
  npm run tool:add-word "Japan" --preserve-case
  npm run tool:add-word "PB&J" "20250101" --preserve-case

Validation Rules:
  - Word must exist in the configured dictionary API
  - Date must be today or in the past (no future dates)
  - Each word can only appear once globally across all dates
  - Each date can only have one word (use --overwrite to replace)
  - Words are converted to lowercase unless --preserve-case is used
${COMMON_ENV_DOCS}
`;

// Get command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  showHelp(HELP_TEXT);
  process.exit(0);
}

// Parse options - check and remove each flag immediately
const overwriteIndex = args.findIndex(arg => arg === '--overwrite' || arg === '-o');
const hasOverwrite = overwriteIndex !== -1;
if (hasOverwrite) {
  args.splice(overwriteIndex, 1);
}

const preserveCaseIndex = args.findIndex(arg => arg === '--preserve-case' || arg === '-p');
const hasPreserveCase = preserveCaseIndex !== -1;
if (hasPreserveCase) {
  args.splice(preserveCaseIndex, 1);
}

const [word, date] = args;

if (!word) {
  console.error('Word is required', { word });
  showHelp(HELP_TEXT);
  process.exit(1);
}

console.log('Add word tool starting...');
addWord(word, date, hasOverwrite, hasPreserveCase);
