#!/usr/bin/env node

import http from 'http';
import https from 'https';
import { URL } from 'url';

import { COMMON_ENV_DOCS, showHelp } from '~tools/help-utils';

const HELP_TEXT = `
Ping Search Engines Tool

Notifies search engines about sitemap updates to improve content discovery.
Uses Ping-O-Matic service to ping Google, Bing, and other search engines.

Usage:
  npm run tool:local tools/ping-search-engines.ts [options]
  npm run tool:ping-search-engines [options]

Options:
  --site-url <url>           Base URL of the deployed site (required)
  --deployed-hash <hash>     Hash of deployed content for change detection
  --dry-run                  Preview what would be pinged without actually pinging
  --force                    Ping regardless of change detection
  -h, --help                 Show this help message

Examples:
  npm run tool:ping-search-engines --site-url "https://example.com"
  npm run tool:ping-search-engines --site-url "https://example.com" --dry-run
  npm run tool:ping-search-engines --site-url "https://example.com" --deployed-hash "abc123" --force

Change Detection:
  - Fetches /health.txt from site to compare words_hash
  - Only pings if content has changed (hash mismatch)
  - Use --force to bypass change detection

Services Notified:
  - Google (via Ping-O-Matic)
  - Bing (via Ping-O-Matic)
  - Other aggregators supported by Ping-O-Matic
${COMMON_ENV_DOCS}
`;

/**
 * Gets the value for a CLI flag from an argument array
 * @param flag - The flag to search for (e.g., '--site-url')
 * @param argsArr - Array of command line arguments
 * @returns The value following the flag, or undefined if not found
 */
function getArgValue(flag: string, argsArr: string[]): string | undefined {
  const idx = argsArr.findIndex(arg => arg === flag);
  if (idx !== -1 && argsArr[idx + 1] && !argsArr[idx + 1].startsWith('--')) {
    return argsArr[idx + 1];
  }
  return undefined;
}

// Parse command line arguments
const args = process.argv.slice(2);

// Check for help flag
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  showHelp(HELP_TEXT);
  process.exit(0);
}

const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');

const siteUrlArg = getArgValue('--site-url', args);
const deployedHashArg = getArgValue('--deployed-hash', args);

if (!siteUrlArg) {
  console.error('Site URL required');
  showHelp(HELP_TEXT);
  process.exit(1);
}

const siteUrl = siteUrlArg.endsWith('/') ? siteUrlArg.slice(0, -1) : siteUrlArg;
const sitemapUrl = `${siteUrl}/sitemap-index.xml`;

// List of working sitemap notification services
const engineList = [
  {
    engine: {
      name: 'Ping-O-Matic',
      url: `http://rpc.pingomatic.com/ping/?title=${encodeURIComponent(process.env.SITE_TITLE || 'Occasional Word of the Day')}&blogurl=${encodeURIComponent(siteUrl)}&rssurl=${encodeURIComponent(sitemapUrl)}&chk_weblogscom=on&chk_google=on`,
    },
  },
];

interface SearchEngine {
  name: string;
  url: string;
}

interface SearchEngineConfig {
  engine: SearchEngine;
}

interface PingResult {
  engine: string;
  status?: number;
  error?: string;
  data?: string;
}

/**
 * Pings a search engine with sitemap notification
 * @param engineObj - Search engine configuration object
 * @returns Promise resolving to ping result
 */
function pingSearchEngine(engineObj: SearchEngineConfig): Promise<PingResult> {
  const engine = engineObj.engine;
  return new Promise((resolve, reject) => {
    console.log(`Pinging ${engine.name}...`);
    const url = new URL(engine.url);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
    };

    // Use http for http URLs, https for https URLs
    const requestLib = url.protocol === 'https:' ? https : http;

    const req = requestLib.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          engine: engine.name,
          status: res.statusCode,
          data: data.slice(0, 100), // Truncate long responses
        });
      });
    });
    req.on('error', (error) => {
      reject({
        engine: engine.name,
        error: error.message,
      });
    });
    req.end();
  });
}

/**
 * Fetches the deployed word hash from the /health.txt endpoint for change detection
 * @returns Promise resolving to the deployed hash or null if not found
 */
async function fetchDeployedHash(): Promise<string | null> {
  return new Promise((resolve) => {
    const healthUrl = `${siteUrl}/health.txt`;
    const get = healthUrl.startsWith('https:') ? https.get : http.get;
    get(healthUrl, (res) => {
      let data = '';
      res.on('data', chunk => {
 data += chunk;
});
      res.on('end', () => {
        const match = data.match(/^words_hash:\s*(\w+)/m);
        if (match) {
          resolve(match[1]);
        } else {
          console.warn('Could not find words_hash in health.txt');
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error(`Error fetching health.txt: ${err.message}`);
      resolve(null);
    });
  });
}

/**
 * Pings all configured search engines with sitemap updates
 * Includes change detection to avoid unnecessary pings
 */
async function pingAll(): Promise<void> {
  console.log(`Checking sitemap: ${sitemapUrl}`);
  console.log(`Site URL: ${siteUrl}`);
  if (deployedHashArg && !isForce) {
    const remoteHash = await fetchDeployedHash();
    if (remoteHash === deployedHashArg) {
      console.log('No new content detected (hash matches deployed). Skipping ping.');
      return;
    }
    if (!remoteHash) {
      console.warn('Could not fetch or parse deployed hash. Will ping as fallback.');
    } else {
      console.log(`Hash changed: deployed=${deployedHashArg}, live=${remoteHash}. Will ping search engines.`);
    }
  }
  if (isDryRun) {
    console.log('DRY RUN MODE: Would ping the following services:');
    engineList.forEach(engineObj =>
      console.log(`- ${engineObj.engine.name}: ${engineObj.engine.url}`),
    );
    return;
  }
  engineList.forEach(engineObj =>
    console.log(`Pinging: ${engineObj.engine.name} - ${engineObj.engine.url}`),
  );
  const results = await Promise.all(
    engineList.map(engineObj => pingSearchEngine(engineObj).catch(error => error)),
  );

  results.forEach(result => {
    if (result.error) {
      console.error('Failed to ping search engine', { engine: result.engine, error: result.error });
      return;
    }
    console.log('Successfully pinged search engine', { engine: result.engine, status: result.status });
  });
  console.log('Finished pinging search engines');
}

pingAll().catch(error => {
  console.error('Failed to complete ping service', { error: error.message });
  process.exit(0); // Exit with success to not fail workflows
});
