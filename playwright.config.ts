import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Real Browser Testing
 * 
 * Purpose: Test SDK in actual browsers (Chrome, Firefox, Safari)
 * This catches issues that jsdom might miss!
 * 
 * Installation:
 *   npm install --save-dev @playwright/test
 *   npx playwright install
 * 
 * Usage:
 *   npm run test:e2e
 */

export default defineConfig({
  testDir: './test/e2e',
  
  // Output directory for test artifacts (NOT test-results to avoid conflicts)
  outputDir: 'reports/playwright-test-results',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure project for Chrome only (Phase 2 - Quick & Essential)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before starting tests (if needed)
  // Run a local web server for browser tests (to avoid CORS issues with file://)
  webServer: {
    command: 'npx http-server . -p 8765 --cors -s --silent',
    port: 8765,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

