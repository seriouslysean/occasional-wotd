// PROTOTYPE (proto/astro-integration). The engine as an Astro integration.
//
// Plain JavaScript on purpose, and it imports no engine TypeScript: Astro
// loads a site's astro.config through a minimal Vite server that leaves
// node_modules to Node, and Node refuses to strip types under node_modules.
// The three helpers astro.config.ts takes from the engine (code hash, hex
// color check, Wordnik default URL) are therefore copied here. That is a
// spike shortcut: the engine's own astro.config.ts is untouched and the two
// now state the same configuration twice.

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sitemap from '@astrojs/sitemap';
import { envField } from 'astro/config';

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'));

// Copied from constants/defaults.ts
const DEFAULT_WORDNIK_WEBSITE_URL = 'https://www.wordnik.com';

// Copied from utils/color-utils.ts
const isHexColor = value => /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value.trim());

const colorFields = {
  COLOR_PRIMARY: { default: '#9a3412' },
  COLOR_PRIMARY_LIGHT: { default: '#c2410c' },
  COLOR_PRIMARY_DARK: { default: '#7c2d12' },
  COLOR_DARK_PRIMARY: { optional: true },
  COLOR_DARK_PRIMARY_LIGHT: { optional: true },
  COLOR_DARK_PRIMARY_DARK: { optional: true },
  COLOR_DARK_BACKGROUND: { optional: true },
  COLOR_DARK_BACKGROUND_LIGHT: { optional: true },
  COLOR_DARK_TEXT: { optional: true },
  COLOR_DARK_TEXT_LIGHT: { optional: true },
  COLOR_DARK_BORDER: { optional: true },
};

const defaults = {
  SITE_URL: 'https://localhost:4321',
  SITE_TITLE: 'Occasional Word of the Day',
  SITE_DESCRIPTION: 'A word-of-the-day site featuring interesting vocabulary',
  SITE_ID: 'occasional-wotd',
  SOURCE_DIR: '',
  WORDNIK_WEBSITE_URL: DEFAULT_WORDNIK_WEBSITE_URL,
};

// Every file below a directory, as paths relative to the package root with
// forward slashes: what `git ls-files src/` prints in the engine repository.
const listFiles = (relativeDir) =>
  readdirSync(path.join(PACKAGE_ROOT, relativeDir), { withFileTypes: true }).flatMap((entry) => {
    const relative = `${relativeDir}/${entry.name}`;
    return entry.isDirectory() ? listFiles(relative) : [relative];
  });

// utils/code-hash.ts, reading from the package instead of the working
// directory. A site has no engine .git, so the release fingerprint is taken
// from the installed files.
const getCodeHash = (files) => {
  const hash = createHash('sha256');
  files.toSorted().forEach((file) => {
    hash.update(file);
    hash.update('\0');
    hash.update(readFileSync(path.join(PACKAGE_ROOT, file)));
  });
  return hash.digest('hex').slice(0, 8);
};

// src/pages/browse/[year]/index.astro -> /browse/[year]
// src/pages/ga-init.js.ts             -> /ga-init.js
const toRoute = (file) => {
  const relative = file.slice('src/pages/'.length).replace(/\.(astro|ts)$/, '');
  const pattern = `/${relative}`.replace(/\/index$/, '') || '/';
  return { pattern, entrypoint: `${pkg.name}/${file}` };
};

const loadEnvironment = () => {
  // Load .env locally when present, skip in CI. Variables already set win.
  if (!process.env.CI && existsSync('.env')) {
    process.loadEnvFile();
  }

  Object.entries(defaults).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  for (const name of Object.keys(colorFields)) {
    const value = process.env[name];
    if (value === undefined) {
      continue;
    }
    const normalizedValue = value.trim();
    if (!normalizedValue) {
      delete process.env[name];
      continue;
    }
    if (!isHexColor(normalizedValue)) {
      throw new Error(`${name} must be a hex color such as #9a3412, got ${JSON.stringify(value)}`);
    }
    process.env[name] = normalizedValue;
  }

  const missing = ['SITE_URL', 'SITE_TITLE', 'SITE_DESCRIPTION', 'SITE_ID'].filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const publicString = options => envField.string({ context: 'client', access: 'public', ...options });
const publicBoolean = options => envField.boolean({ context: 'client', access: 'public', ...options });

/**
 * The word-of-the-day engine: every page and endpoint, and the configuration
 * the engine's own astro.config.ts sets. Sentry is not wired up here.
 * @returns {import('astro').AstroIntegration}
 */
export default function occasionalWotd() {
  loadEnvironment();

  const release = `${pkg.name}@${pkg.version}+${getCodeHash(listFiles('src'))}`;
  const routes = listFiles('src/pages').map(toRoute);

  return {
    name: pkg.name,
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig }) => {
        routes.forEach(route => injectRoute(route));

        updateConfig({
          site: process.env.SITE_URL,
          base: process.env.BASE_PATH,
          trailingSlash: 'always',
          build: { format: 'directory' },
          compressHTML: true,
          devToolbar: { enabled: false },
          env: {
            schema: {
              SITE_TITLE: publicString({ default: defaults.SITE_TITLE }),
              SITE_DESCRIPTION: publicString({ default: defaults.SITE_DESCRIPTION }),
              SITE_ID: publicString({ default: defaults.SITE_ID }),
              SITE_SHORT_NAME: publicString({ optional: true }),
              SITE_URL: publicString({ default: defaults.SITE_URL, url: true }),
              SITE_LOCALE: publicString({ default: 'en-US' }),
              SITE_KEYWORDS: publicString({ default: '' }),
              SITE_AUTHOR: publicString({ default: '' }),
              SITE_AUTHOR_URL: publicString({ default: '' }),
              SITE_ATTRIBUTION_MESSAGE: publicString({ default: '' }),
              HUMANS_WORD_CURATOR: publicString({ default: '' }),
              HUMANS_DEVELOPER_NAME: publicString({ default: '' }),
              HUMANS_DEVELOPER_CONTACT: publicString({ default: '' }),
              HUMANS_DEVELOPER_SITE: publicString({ default: '' }),
              ...Object.fromEntries(
                Object.entries(colorFields).map(([name, options]) => [name, publicString(options)]),
              ),
              GA_MEASUREMENT_ID: publicString({ optional: true }),
              GA_ENABLED: publicBoolean({ default: false }),
              SENTRY_ENABLED: publicBoolean({ default: false }),
              SENTRY_DSN: publicString({ optional: true }),
              SENTRY_ENVIRONMENT: publicString({ default: 'development' }),
              BASE_PATH: publicString({ default: '/' }),
              SOURCE_DIR: publicString({ default: defaults.SOURCE_DIR }),
              WORDNIK_WEBSITE_URL: publicString({ default: defaults.WORDNIK_WEBSITE_URL, url: true }),
            },
          },
          vite: {
            define: {
              __VERSION__: JSON.stringify(pkg.version),
              __RELEASE__: JSON.stringify(release),
              __TIMESTAMP__: JSON.stringify(new Date().toISOString()),
              __WORD_DATA_PATH__: JSON.stringify(
                process.env.SOURCE_DIR ? `data/${process.env.SOURCE_DIR}/words` : 'data/words',
              ),
            },
            // Found by running `astro dev` in a site: in dev, Astro lists every
            // dependency of a package like this one in ssr.external, and Node
            // then loads this one's JSON entry without the import attribute
            // Vite's transform dropped ("needs an import attribute of type:
            // json"). Naming it here keeps it in Vite's hands. The build was
            // not affected.
            ssr: { noExternal: ['subtlex-word-frequencies'] },
            css: { transformer: 'lightningcss' },
            build: {
              target: 'esnext',
              modulePreload: { polyfill: false },
              reportCompressedSize: false,
              cssMinify: 'lightningcss',
              rollupOptions: {
                output: {
                  chunkFileNames: '_astro/[name]-[hash].js',
                  entryFileNames: '_astro/[name]-[hash].js',
                },
              },
            },
          },
          prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
          markdown: { syntaxHighlight: false },
          security: {
            csp: {
              // An object the integration introduces gets no schema defaults,
              // so the algorithm is stated.
              algorithm: 'SHA-256',
              scriptDirective: {
                resources: ["'self'", 'https://www.googletagmanager.com'],
              },
              directives: [
                "object-src 'none'",
                "base-uri 'self'",
                "worker-src 'self' blob:",
              ],
            },
          },
          integrations: [
            sitemap({ filter: page => !page.endsWith('.txt') }),
          ],
        });
      },
    },
  };
}
