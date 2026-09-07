import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('./src/engine', import.meta.url)),
      '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@save': fileURLToPath(new URL('./src/save', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/ui', import.meta.url)),
      '@i18n': fileURLToPath(new URL('./src/i18n', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**'],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['src/engine/**'],
      reporter: ['text-summary'],
    },
  },
});
