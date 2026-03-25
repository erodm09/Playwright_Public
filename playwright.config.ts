import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment-specific config; fall back to .env.example values
dotenv.config({ path: process.env.ENV_FILE ?? '.env' });

/**
 * Playwright configuration for a multi-project (UI + API) test suite.
 *
 * Projects are intentionally separated so that:
 *  - UI projects run in real browsers (chromium / firefox / webkit)
 *  - The `api` project runs headlessly with no browser overhead
 *  - The `ui-component` project targets isolated component-level UI tests
 *
 * CI behaviour is controlled via the CI environment variable set by
 * GitHub Actions (or any other CI provider).
 */
export default defineConfig({
  testDir: './tests',

  // Parallelise at the worker level for speed; respect CI resource limits
  fullyParallel: true,
  workers: process.env.CI ? 4 : undefined,

  // Fail fast in CI if a test is accidentally left with `.only`
  forbidOnly: !!process.env.CI,

  // Retry flaky tests once on CI; no retries locally for faster feedback
  retries: process.env.CI ? 2 : 0,

  // Reporters: HTML + Allure for rich artefacts, list for terminal readability,
  // JSON for downstream tooling (Slack bots, dashboards, etc.)
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true }],
  ],

  // Shared settings applied to every project unless overridden
  use: {
    // Capture a trace on the first retry so failures are always diagnosable
    trace: 'on-first-retry',

    // Screenshots and video only on failure to keep artefact sizes small
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Reasonable timeouts that distinguish a slow site from a broken test
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  // Output directory for test artefacts (screenshots, traces, videos)
  outputDir: 'test-results/',

  // Global test timeout — increase for slower remote environments
  timeout: 60_000,

  // Expect timeout for assertions
  expect: { timeout: 10_000 },

  // ------------------------------------------------------------------ //
  //  Projects                                                            //
  // ------------------------------------------------------------------ //
  projects: [
    // -- UI / E2E -------------------------------------------------------
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL ?? 'https://practicetestautomation.com',
        viewport: { width: 1280, height: 720 },
      },
      testMatch: ['tests/e2e/**/*.spec.ts', 'tests/ui/**/*.spec.ts'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: process.env.BASE_URL ?? 'https://practicetestautomation.com',
      },
      testMatch: ['tests/e2e/**/*.spec.ts'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        baseURL: process.env.BASE_URL ?? 'https://practicetestautomation.com',
      },
      testMatch: ['tests/e2e/**/*.spec.ts'],
    },

    // -- Mobile viewports (smoke-layer) ---------------------------------
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        baseURL: process.env.BASE_URL ?? 'https://practicetestautomation.com',
      },
      testMatch: ['tests/e2e/**/*.spec.ts'],
      grep: /@smoke/,
    },

    // -- API ------------------------------------------------------------
    {
      name: 'api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://reqres.in',
        // No browser needed; the request context is created inside fixtures
        extraHTTPHeaders: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      testMatch: ['tests/api/**/*.spec.ts'],
    },
  ],
});
