import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end configuration.
 *
 * The suite runs against a production build served by `vite preview`, not the dev server:
 * that is what a player actually gets, and it catches the class of bug that only appears
 * after minification and chunking.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 1 : 0,
  workers: process.env['CI'] ? 2 : undefined,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 90_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:4319',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    /*
     * A distinctive port, never reused: sharing one with whatever else is running on the
     * machine is how a suite ends up testing somebody else's application.
     *
     * The build goes to its own directory too. Sharing `dist` with local development meant a
     * test run could overwrite a build somebody was serving, and produce 404s for assets that
     * were on disk a second earlier — an hour of confusion the first time it happens.
     */
    command:
      'npm run build -- --outDir dist-e2e --emptyOutDir && npm run preview -- --outDir dist-e2e --port 4319 --strictPort',
    url: 'http://localhost:4319',
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
