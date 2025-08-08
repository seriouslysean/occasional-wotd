import { showHelp } from '~tools/help-utils';
import { findExistingWord, generateGenericShareImage, generateShareImage, getAllWords } from '~tools/utils';
import { getAllPageMetadata } from '~utils/page-metadata-utils';

const HELP_TEXT = `
Generate Images Tool

Usage:
  npm run tool:local tools/generate-images.ts [options]
  npm run tool:generate-images [options]

Options:
  --words                   Generate images for all words only
  --generic                 Generate images for all generic pages only
  --word <word>             Generate image for specific word
  --page <path>             Generate image for specific page path
  --force                   Regenerate images even if they already exist
  -h, --help                Show this help message

Examples:
  npm run tool:generate-images                    # Generate all word and page images
  npm run tool:generate-images --words            # Generate all word images
  npm run tool:generate-images --generic          # Generate all generic page images
  npm run tool:generate-images --word serendipity # Generate image for specific word
  npm run tool:generate-images --page stats       # Generate image for stats page

Environment Variables (for GitHub workflows):
  SOURCE_DIR                 Data source directory (default: demo)
  SITE_TITLE                 Site title for images
  COLOR_PRIMARY             Primary color for gradients
  COLOR_PRIMARY_LIGHT       Light primary color
  COLOR_PRIMARY_DARK        Dark primary color

Requirements:
  - Word must exist in data files for word images
  - Required environment variables must be set
  - Output directory will be created if it doesn't exist
`;

/**
 * Generates image for a specific word
 */
async function generateSingleImage(word: string): Promise<boolean> {
  try {
    const wordData = findExistingWord(word);
    if (!wordData) {
      console.error('Word not found in data files', { word });
      return false;
    }

    await generateShareImage(word, wordData.date);
    console.log('Generated image for word', { word, date: wordData.date });
    return true;
  } catch (error) {
    console.error('Failed to generate image for word', { word, error: (error as Error).message });
    return false;
  }
}

/**
 * Generates images for all words
 */
async function generateAllImages(): Promise<void> {
  const allWords = getAllWords();
  console.log('Starting bulk image generation', { wordCount: allWords.length });

  let successCount = 0;
  let errorCount = 0;

  for (const wordData of allWords) {
    try {
      await generateShareImage(wordData.word, wordData.date);
      console.log('Generated image', { word: wordData.word, date: wordData.date });
      successCount++;
    } catch (error) {
      console.error('Failed to generate image', {
        word: wordData.word,
        date: wordData.date,
        error: (error as Error).message,
      });
      errorCount++;
    }
  }

  console.log('Bulk image generation complete', {
    total: allWords.length,
    success: successCount,
    errors: errorCount,
  });
}

/**
 * Generates images for all generic pages (stats, words index, year pages, etc.)
 */
async function generateGenericImages(): Promise<void> {
  const words = getAllWords();
  const allPages = getAllPageMetadata(words);

  // Pages already filtered and ready to use
  const pages = allPages;

  console.log('Starting generic image generation', { pageCount: pages.length });

  let successCount = 0;
  let errorCount = 0;

  for (const page of pages) {
    try {
      await generateGenericShareImage(page.title, page.path);
      console.log('Generated generic image', { title: page.title, path: page.path });
      successCount++;
    } catch (error) {
      console.error('Failed to generate generic image', {
        title: page.title,
        path: page.path,
        error: (error as Error).message,
      });
      errorCount++;
    }
  }

  console.log('Generic image generation complete', {
    total: pages.length,
    success: successCount,
    errors: errorCount,
  });
}

/**
 * Generates image for a specific page path
 */
async function generatePageImage(pagePath: string): Promise<boolean> {
  try {
    const words = getAllWords();
    const allPages = getAllPageMetadata(words);
    const page = allPages.find(p => p.path === pagePath);

    if (!page) {
      console.error('Page not found in available pages', { pagePath });
      return false;
    }

    await generateGenericShareImage(page.title, page.path);
    console.log('Generated page image', { title: page.title, path: page.path });
    return true;
  } catch (error) {
    console.error('Failed to generate page image', { pagePath, error: (error as Error).message });
    return false;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h')) {
  showHelp(HELP_TEXT);
  process.exit(0);
}

// Parse options
const forceIndex = args.findIndex(arg => arg === '--force');
const hasForce = forceIndex !== -1;
if (hasForce) {
  args.splice(forceIndex, 1);
}

const wordsIndex = args.findIndex(arg => arg === '--words');
const hasWords = wordsIndex !== -1;
if (hasWords) {
  args.splice(wordsIndex, 1);
}

const genericIndex = args.findIndex(arg => arg === '--generic');
const hasGeneric = genericIndex !== -1;
if (hasGeneric) {
  args.splice(genericIndex, 1);
}

const pageIndex = args.findIndex(arg => arg === '--page');
const hasPage = pageIndex !== -1;
const pagePath = hasPage ? (args.splice(pageIndex, 1), args.splice(pageIndex, 1)[0] || '') : '';

const wordIndex = args.findIndex(arg => arg === '--word');
const hasWord = wordIndex !== -1;
const word = hasWord ? (args.splice(wordIndex, 1), args.splice(wordIndex, 1)[0] || '') : '';

// Main execution
(async () => {
  try {
    console.log('Generate images tool starting...');
    if (hasPage && pagePath) {
      // Generate specific page image
      const success = await generatePageImage(pagePath);
      process.exit(success ? 0 : 1);
    }

    if (hasWord && word) {
      // Generate single word image
      const success = await generateSingleImage(word);
      process.exit(success ? 0 : 1);
    }

    const runWords = hasWords || (!hasWords && !hasGeneric);
    const runGeneric = hasGeneric || (!hasWords && !hasGeneric);

    if (runWords) {
      await generateAllImages();
    }

    if (runGeneric) {
      await generateGenericImages();
    }

    process.exit(0);
  } catch (error) {
    console.error('Tool execution failed', { error: (error as Error).message });
    process.exit(1);
  }
})();