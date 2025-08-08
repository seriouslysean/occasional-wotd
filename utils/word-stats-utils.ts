import type {
  WordData,
  WordLetterStatsResult,
  WordStatsResult,
  WordStreakStatsResult,
} from '~types/word';
import { dateToYYYYMMDD, YYYYMMDDToDate } from '~utils/date-utils';
import {
  countSyllables,
  getConsonantCount,
  getVowelCount,
  getWordEndings,
  hasAlphabeticalSequence,
  hasDoubleLetters,
  hasTripleLetters,
  isAllConsonants,
  isAllVowels,
  isPalindrome,
  isStartEndSame,
} from '~utils/text-utils';

/**
 * Analyzes word data to extract basic statistics including longest/shortest words and letter frequency
 */
export const getWordStats = (words: WordData[]): WordStatsResult => {
  const emptyStats: WordStatsResult = {
    longest: null,
    shortest: null,
    longestPalindrome: null,
    shortestPalindrome: null,
    letterFrequency: {},
  };

  return words.reduce((stats, wordData) => {
    const word = wordData.word;
    const length = word.length;

    if (!stats.longest || length > stats.longest.length) {
      stats.longest = { word, length };
    }
    if (!stats.shortest || length < stats.shortest.length) {
      stats.shortest = { word, length };
    }

    if (isPalindrome(word)) {
      if (!stats.longestPalindrome || length > stats.longestPalindrome.length) {
        stats.longestPalindrome = { word, length };
      }
      if (!stats.shortestPalindrome || length < stats.shortestPalindrome.length) {
        stats.shortestPalindrome = { word, length };
      }
    }

    const uniqueLetters = new Set(word.toLowerCase());
    for (const letter of uniqueLetters) {
      stats.letterFrequency[letter] = (stats.letterFrequency[letter] || 0) + 1;
    }

    return stats;
  }, emptyStats);
};

/**
 * Converts letter frequency data into sorted statistics
 */
export const getLetterFrequencyStats = (
  letterFrequency: Record<string, number>,
): WordLetterStatsResult => {
  if (Object.keys(letterFrequency).length === 0) {
    return [];
  }
  return Object.entries(letterFrequency)
    .filter(([letter]) => /^[a-z]$/i.test(letter))
    .sort(([, a], [, b]) => b - a);
};

/**
 * Analyzes words for various letter patterns
 */
export const getLetterPatternStats = (words: WordData[]) => {
  const patterns = {
    startEndSame: [] as WordData[],
    doubleLetters: [] as WordData[],
    tripleLetters: [] as WordData[],
    alphabetical: [] as WordData[],
    palindromes: [] as WordData[],
  };

  for (const wordObj of words) {
    const word = wordObj.word;
    
    if (isPalindrome(word)) {
      patterns.palindromes.push(wordObj);
    }
    if (isStartEndSame(word)) {
      patterns.startEndSame.push(wordObj);
    }
    if (hasDoubleLetters(word)) {
      patterns.doubleLetters.push(wordObj);
    }
    if (hasTripleLetters(word)) {
      patterns.tripleLetters.push(wordObj);
    }
    if (hasAlphabeticalSequence(word)) {
      patterns.alphabetical.push(wordObj);
    }
  }

  return patterns;
};

/**
 * Analyzes words for specific ending patterns
 */
export const getWordEndingStats = (words: WordData[]) => {
  const endings = {
    ing: [] as WordData[],
    ed: [] as WordData[],
    ly: [] as WordData[],
    ness: [] as WordData[],
    ful: [] as WordData[],
    less: [] as WordData[],
  };

  for (const wordObj of words) {
    const matchedEndings = getWordEndings(wordObj.word);
    for (const ending of matchedEndings) {
      if (ending in endings) {
        endings[ending as keyof typeof endings].push(wordObj);
      }
    }
  }

  return endings;
};

/**
 * Analyzes words for vowel/consonant patterns
 */
export const getPatternStats = (words: WordData[]) => {
  return {
    allVowels: words.filter(w => isAllVowels(w.word)),
    allConsonants: words.filter(w => isAllConsonants(w.word)),
    palindromes: words.filter(w => isPalindrome(w.word)),
  };
};

/**
 * Analyzes letter frequency and returns most/least common letters
 */
export const getLetterStats = (words: WordData[]) => {
  const letterFrequency: Record<string, number> = {};

  for (const wordObj of words) {
    const word = wordObj.word.toLowerCase();
    for (const letter of word) {
      if (/^[a-z]$/i.test(letter)) {
        letterFrequency[letter] = (letterFrequency[letter] || 0) + 1;
      }
    }
  }

  const sortedLetters = Object.entries(letterFrequency)
    .filter(([letter]) => /^[a-z]$/i.test(letter))
    .sort(([, a], [, b]) => b - a);

  const [mostCommonEntry] = sortedLetters;
  const leastCommonEntry = sortedLetters[sortedLetters.length - 1];

  return {
    mostCommon: mostCommonEntry?.[0] || '',
    leastCommon: leastCommonEntry?.[0] || '',
    frequency: letterFrequency,
  };
};

/**
 * Check if two dates are consecutive days
 */
export const areConsecutiveDays = (olderDate: string, newerDate: string): boolean => {
  const dOlder = YYYYMMDDToDate(olderDate);
  const dNewer = YYYYMMDDToDate(newerDate);
  
  if (!dOlder || !dNewer) {
    console.warn('Invalid date in areConsecutiveDays', { olderDate, newerDate });
    return false;
  }
  
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.abs(dNewer.getTime() - dOlder.getTime()) === oneDayMs;
};

/**
 * Analyze word streaks to determine current and longest sequences
 */
export const getCurrentStreakStats = (words: WordData[]): WordStreakStatsResult => {
  if (words.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isActive: false,
    };
  }

  const sortedWords = [...words].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date();
  const todayString = dateToYYYYMMDD(today);
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(today.getDate() - 1);
  const yesterdayString = dateToYYYYMMDD(yesterdayDate);

  const mostRecentWord = sortedWords[0];
  const isActive =
    !!mostRecentWord &&
    (mostRecentWord.date === todayString || mostRecentWord.date === yesterdayString);

  const calculateCurrentStreak = () => {
    if (!isActive || !mostRecentWord) {
      return 0;
    }

    const streakData = {
      count: 1,
      lastDate: mostRecentWord.date,
    };

    for (const word of sortedWords.slice(1)) {
      if (areConsecutiveDays(word.date, streakData.lastDate)) {
        streakData.count++;
        streakData.lastDate = word.date;
      } else {
        break;
      }
    }

    return streakData.count;
  };

  const calculateLongestStreak = () => {
    if (sortedWords.length <= 1) {
      return sortedWords.length;
    }

    const streakData = {
      longest: 0,
      current: 1,
    };

    for (const [index, word] of sortedWords.entries()) {
      if (index === 0) {
        continue;
      }

      if (areConsecutiveDays(word.date, sortedWords[index - 1].date)) {
        streakData.current++;
      } else {
        streakData.longest = Math.max(streakData.longest, streakData.current);
        streakData.current = 1;
      }
    }

    return Math.max(streakData.longest, streakData.current);
  };

  return {
    currentStreak: calculateCurrentStreak(),
    longestStreak: calculateLongestStreak(),
    isActive,
  };
};

/**
 * Get the words that make up the longest streak in the collection
 */
export const getLongestStreakWords = (words: WordData[]): WordData[] => {
  if (words.length <= 1) {
    return words;
  }

  const sortedWords = [...words].sort((a, b) => b.date.localeCompare(a.date));

  const { longestStreak } = sortedWords.slice(1).reduce(
    ({ longestStreak, currentStreak, previousWord }, word) => {
      const isConsecutive = areConsecutiveDays(word.date, previousWord.date);
      const newCurrentStreak = isConsecutive ? [...currentStreak, word] : [word];
      const newLongestStreak =
        newCurrentStreak.length > longestStreak.length
          ? newCurrentStreak
          : longestStreak;

      return {
        longestStreak: newLongestStreak,
        currentStreak: newCurrentStreak,
        previousWord: word,
      };
    },
    {
      longestStreak: [sortedWords[0]],
      currentStreak: [sortedWords[0]],
      previousWord: sortedWords[0],
    },
  );

  return longestStreak.reverse();
};

/**
 * Finds words with the most and least syllables
 */
export const getSyllableStats = (
  words: WordData[],
): { mostSyllables: WordData | null; leastSyllables: WordData | null } => {
  if (words.length === 0) {
    return {
      mostSyllables: null,
      leastSyllables: null,
    };
  }

  return words.reduce(
    (acc, word) => {
      const syllables = countSyllables(word.word);

      if (!acc.mostSyllables || syllables > countSyllables(acc.mostSyllables.word)) {
        acc.mostSyllables = word;
      }

      if (
        !acc.leastSyllables ||
        syllables < countSyllables(acc.leastSyllables.word)
      ) {
        acc.leastSyllables = word;
      }

      return acc;
    },
    {
      mostSyllables: words[0],
      leastSyllables: words[0],
    },
  );
};

/**
 * Finds words with the most vowels and consonants
 */
export const getLetterTypeStats = (
  words: WordData[],
): { mostVowels: WordData | null; mostConsonants: WordData | null } => {
  if (words.length === 0) {
    return {
      mostVowels: null,
      mostConsonants: null,
    };
  }

  return words.reduce(
    (acc, word) => {
      const vowelCount = getVowelCount(word.word);
      const consonantCount = getConsonantCount(word.word);

      if (!acc.mostVowels || vowelCount > getVowelCount(acc.mostVowels.word)) {
        acc.mostVowels = word;
      }

      if (
        !acc.mostConsonants ||
        consonantCount > getConsonantCount(acc.mostConsonants.word)
      ) {
        acc.mostConsonants = word;
      }

      return acc;
    },
    {
      mostVowels: words[0],
      mostConsonants: words[0],
    },
  );
};

/**
 * Helper function to find a word's date from a list of words
 */
export const findWordDate = (
  words: WordData[],
  targetWord: string,
): string | undefined => {
  if (!targetWord) {
    return undefined;
  }
  return words.find(w => w?.word === targetWord)?.date;
};

/**
 * Calculate chronological milestone words (1st, 100th, 200th, etc.) from sorted words
 */
export function getChronologicalMilestones(words: WordData[]): Array<{milestone: number, word: WordData}> {
  if (words.length === 0) {
    return [];
  }
  
  return [
    { milestone: 1, word: words[0] },
    ...[25, 50, 75]
      .filter(m => words.length >= m)
      .map(m => ({ milestone: m, word: words[m - 1] })),
    ...Array.from(
      { length: Math.floor(words.length / 100) },
      (_, idx) => {
        const milestone = (idx + 1) * 100;
        return { milestone, word: words[milestone - 1] };
      },
    ),
  ];
}