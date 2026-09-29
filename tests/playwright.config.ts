import { defineConfig, devices } from '@playwright/test';

// Pre-scaffolded canonical config — edit the marked lines only; do not re-create.
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 60_000,
  retries: 0,
  workers: 2,
  reporter: [
    ['list'],
    ['json', { outputFile: './test-results/results.json' }],
  ],
  use: {
    // farm-ts: localhost — Vite proxies /api to FastAPI; the external preview host is not in-pod routable.
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    trace: 'on-first-retry',
    headless: true,
    ignoreHTTPSErrors: true,
  },
  projects: [
    // DutchVacancy is a general responsive web app, not mobile-only — desktop matches
    // the brief; the mobile project is deleted per this file's own instruction above.
    // Only chromium is installed — never switch to iPhone/webkit device descriptors.
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
});
