import 'dotenv/config';

interface Environment {
  SITE_URL: string;
  SITE_TITLE: string;
  SITE_DESCRIPTION: string;
  SITE_ID: string;
  BASE_PATH: string;
  SOURCE_DIR: string;
  SITE_LOCALE: string;
  SITE_AUTHOR: string;
  SITE_AUTHOR_URL: string;
  SITE_ATTRIBUTION_MESSAGE: string;
  SITE_KEYWORDS: string[];
  SENTRY_ENABLED: boolean;
  NODE_ENV: string;
  PACKAGE_VERSION: string;
}

const defaults = {
  SITE_URL: 'https://localhost:4321',
  SITE_TITLE: 'Occasional Word of the Day',
  SITE_DESCRIPTION: 'A word-of-the-day site featuring interesting vocabulary',
  SITE_ID: 'occasional-wotd',
  SOURCE_DIR: 'demo',
  BASE_PATH: '/',
  SITE_LOCALE: 'en-US',
} as const;

const rawEnv: Record<string, string | undefined> = {
  SITE_URL: process.env.SITE_URL,
  SITE_TITLE: process.env.SITE_TITLE,
  SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
  SITE_ID: process.env.SITE_ID,
  BASE_PATH: process.env.BASE_PATH,
  SOURCE_DIR: process.env.SOURCE_DIR,
  SITE_LOCALE: process.env.SITE_LOCALE,
  SITE_AUTHOR: process.env.SITE_AUTHOR,
  SITE_AUTHOR_URL: process.env.SITE_AUTHOR_URL,
  SITE_ATTRIBUTION_MESSAGE: process.env.SITE_ATTRIBUTION_MESSAGE,
  SITE_KEYWORDS: process.env.SITE_KEYWORDS,
  SENTRY_ENABLED: process.env.SENTRY_ENABLED,
  NODE_ENV: process.env.NODE_ENV,
  PACKAGE_VERSION: process.env.npm_package_version,
};

Object.entries(defaults).forEach(([key, value]) => {
  if (!rawEnv[key]) {
    rawEnv[key] = value;
  }
});

const required = ['SITE_URL', 'SITE_TITLE', 'SITE_DESCRIPTION', 'SITE_ID'] as const;
const missing = required.filter((key) => !rawEnv[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

function toBool(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) {
return defaultValue;
}
  return value === 'true';
}

export const env: Environment = {
  SITE_URL: rawEnv.SITE_URL!,
  SITE_TITLE: rawEnv.SITE_TITLE!,
  SITE_DESCRIPTION: rawEnv.SITE_DESCRIPTION!,
  SITE_ID: rawEnv.SITE_ID!,
  BASE_PATH: rawEnv.BASE_PATH || '/',
  SOURCE_DIR: rawEnv.SOURCE_DIR || 'demo',
  SITE_LOCALE: rawEnv.SITE_LOCALE || 'en-US',
  SITE_AUTHOR: rawEnv.SITE_AUTHOR || '',
  SITE_AUTHOR_URL: rawEnv.SITE_AUTHOR_URL || '',
  SITE_ATTRIBUTION_MESSAGE: rawEnv.SITE_ATTRIBUTION_MESSAGE || '',
  SITE_KEYWORDS: rawEnv.SITE_KEYWORDS ? rawEnv.SITE_KEYWORDS.split(',').filter(Boolean) : [],
  SENTRY_ENABLED: toBool(rawEnv.SENTRY_ENABLED),
  NODE_ENV: rawEnv.NODE_ENV || 'production',
  PACKAGE_VERSION: rawEnv.PACKAGE_VERSION || '0.0.0',
};

export function getEnv<K extends keyof Environment>(key: K): Environment[K] {
  return env[key];
}

