import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { statSync } from 'node:fs';

import sitemap from '@astrojs/sitemap';
import sentry from '@sentry/astro';
import { defineConfig } from 'astro/config';

import pkg from './package.json' with { type: 'json' };

// Generate code hash for Sentry release version
function getCodeHash() {
  const hash = createHash('sha256');

  const srcFiles = execSync('git ls-files src/', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(file => file.length > 0)
    .sort();

  srcFiles.forEach(file => {
    try {
      const { size } = statSync(file);
      hash.update(`${file}:${size}`);
    } catch {
      // Skip files that don't exist (deleted but not yet committed)
      // This ensures consistent fingerprints across downstream apps
    }
  });

  return hash.digest('hex').substring(0, 8);
}

// Load .env locally, skip in CI (GitHub Actions etc)
if (!process.env.CI) {
  import('dotenv/config');
}

// Validate required environment variables
const requiredEnvVars = [
  'SITE_URL',
  'SITE_TITLE',
  'SITE_DESCRIPTION',
  'SITE_ID',
  'SITE_AUTHOR',
  'WORDNIK_API_KEY',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const site = process.env.SITE_URL;
const base = process.env.BASE_PATH;
const sentryEnvironment = process.env.SENTRY_ENVIRONMENT || 'development';
const codeHash = getCodeHash();
const version = pkg.version;
const release = `${pkg.name}@${version}+${codeHash}`;
const timestamp = new Date().toISOString();

if (!process.env.SENTRY_RELEASE) {
  process.env.SENTRY_RELEASE = release;
}

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    resolve: {
      alias: {
        '~': '/src',
        '~components': '/src/components',
        '~layouts': '/src/layouts',
        '~utils': '/src/utils',
        '~data': '/data',
        '~config': '/config',
        '~styles': '/src/styles',
        '~adapters': '/adapters',
        '~types': '/types',
        '~tools': '/tools',
      },
    },
    define: {
      __VERSION__: JSON.stringify(pkg.version),
      __RELEASE__: JSON.stringify(release),
      __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
      __SENTRY_ENVIRONMENT__: JSON.stringify(sentryEnvironment),
      __SITE_ID__: JSON.stringify(process.env.SITE_ID),
      __SITE_TITLE__: JSON.stringify(process.env.SITE_TITLE),
      __SITE_DESCRIPTION__: JSON.stringify(process.env.SITE_DESCRIPTION),
      __SITE_URL__: JSON.stringify(process.env.SITE_URL || ''),
      __TIMESTAMP__: JSON.stringify(timestamp),
      __HUMANS_WORD_CURATOR__: JSON.stringify(process.env.HUMANS_WORD_CURATOR || ''),
      __HUMANS_DEVELOPER_NAME__: JSON.stringify(process.env.HUMANS_DEVELOPER_NAME || ''),
      __HUMANS_DEVELOPER_CONTACT__: JSON.stringify(process.env.HUMANS_DEVELOPER_CONTACT || ''),
      __HUMANS_DEVELOPER_SITE__: JSON.stringify(process.env.HUMANS_DEVELOPER_SITE || ''),
      __COLOR_PRIMARY__: JSON.stringify(process.env.COLOR_PRIMARY || '#4a5d4a'),
      __COLOR_PRIMARY_LIGHT__: JSON.stringify(process.env.COLOR_PRIMARY_LIGHT || '#5a6d5a'),
      __COLOR_PRIMARY_DARK__: JSON.stringify(process.env.COLOR_PRIMARY_DARK || '#3a4d3a'),
      __GA_MEASUREMENT_ID__: JSON.stringify(process.env.GA_MEASUREMENT_ID),
      __GA_ENABLED__: process.env.GA_ENABLED === 'true',
      __SHOW_EMPTY_STATS__: process.env.SHOW_EMPTY_STATS === 'true',
    },
    build: {
      target: 'esnext',
      modulePreload: { polyfill: false },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  },
  integrations: [
    ...(process.env.SENTRY_ENABLED === 'true' ? [sentry({
      sourceMapsUploadOptions: {
        project: process.env.SENTRY_PROJECT,
        org: process.env.SENTRY_ORG,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    })] : []),
    sitemap({
      lastmod: new Date(),
      filter: (page) => !page.endsWith('.txt'),
    }),
  ],
});
