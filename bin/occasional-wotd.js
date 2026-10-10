#!/usr/bin/env node
// PROTOTYPE (proto/astro-integration). Runs the engine's CLI tools from an
// installed package.
//
// The tools are TypeScript, and Node refuses to strip types from files under
// node_modules (ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING). This bin is
// plain JavaScript and registers a load hook that strips the types of this
// package's own .ts files itself. module.registerHooks and
// module.stripTypeScriptTypes are both release candidates in Node 26.

import { existsSync, readFileSync } from 'node:fs';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { fileURLToPath } from 'node:url';

const PACKAGE_URL = new URL('../', import.meta.url).href;

const TOOLS = {
  'add-word': 'tools/add-word.ts',
  'generate-images': 'tools/generate-images.ts',
};

const [command, ...args] = process.argv.slice(2);
const tool = command ? TOOLS[command] : undefined;

if (!tool) {
  console.log(`Usage: occasional-wotd <${Object.keys(TOOLS).join('|')}> [options]`);
  process.exit(command === undefined || command === '--help' || command === '-h' ? 0 : 1);
}

// What `npm run tool:local` does with --env-file-if-exists=.env, before any
// tool module is loaded: config/paths.ts and utils/logger.ts read the
// environment when they are imported. Variables already set win.
if (!process.env.CI && existsSync('.env')) {
  process.loadEnvFile('.env');
}

const isOwnTypeScript = (url) =>
  url.startsWith(PACKAGE_URL)
  && url.endsWith('.ts')
  && !url.slice(PACKAGE_URL.length).includes('node_modules/');

registerHooks({
  load(url, context, nextLoad) {
    if (!isOwnTypeScript(url)) {
      return nextLoad(url, context);
    }
    const source = stripTypeScriptTypes(readFileSync(fileURLToPath(url), 'utf8'), { mode: 'strip', sourceUrl: url });
    return { format: 'module', source, shortCircuit: true };
  },
});

// A tool's own entry guard compares process.argv[1] with its module path,
// which is this file here, so each tool exports the function its guard calls.
const { run } = await import(new URL(tool, PACKAGE_URL).href);
await run(args);
