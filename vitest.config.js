import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'adapters/**/*.ts', 'tools/**/*.ts'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.astro/**',
        'tests/**',
      ],
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
      '~components': resolve(__dirname, './src/components'),
      '~layouts': resolve(__dirname, './src/layouts'),
      '~utils': resolve(__dirname, './src/utils'),
      '~adapters': resolve(__dirname, './adapters'),
      '~types': resolve(__dirname, './types'),
      '~tools': resolve(__dirname, './tools'),
      '~data': resolve(__dirname, './data'),
      '~config': resolve(__dirname, './config'),
    },
  },
});
